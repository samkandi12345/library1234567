import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet , KeyboardAvoidingView, KeyboardAvoidingViewBase, TextInput, Alert, ToastAndroid } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';


export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedData: '',
        buttonState: 'normal'
      }
    }

    getCameraPermissions = async () =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: 'clicked',
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      this.setState({
        scanned: true,
        scannedData: data,
        buttonState: 'normal'
      });
    }
    
    checkBookEligibility = async()=>{
      const bookRef = await db.collection("students").where("scannedBookID","=",this.state.scannedBookID).get()
      var transactionType = ""
      if(bookRef.docs.lenght == 0){
        transactionType = false
        console.log(bookRef.docs.lenght)
      }  
      else{
        bookRef.docs.map((doc)=>{
          var book = doc.data()
          if(book.bookAvailabilty){
            transactionType = true
          }
          else{
            transactionType = issue
          }
        })
      }  
    }

    checkStudentEligabilityForBookIssue = async()=>{
      const studentRef = await db.collection("students").where("studentID","==",this.state.scannedStudentID).get()
      var isStudentEligable = ""
      if(studentRef.docs.lenght == 0){
        this.setState({
          scannedStudentID:"",
          scannedBookID:""
        })
        isStudentEligable = false
        Alert.alert("student is not eligable to take a book")
      }  
      else{
        studentRef.docs.map((doc)=>{
          var student = doc.data()
          if(student.numberOfBookIssued < 2){
            isStudentEligable = true
          }
          else{
            isStudentEligable = false
            Alert.alert("the student has alreDY BEEN ISSUED TWO BOOKS")
            this.setState({
              scannedBookID:"",
              scannedStudentID:""
            })
          }
        })
      }

      return isStudentEligable
    }

    checkStudentEligabilityForBookReturn = async()=>{
      const returnRef = await db.collection("transactions").where("scannedBookID","=",this.setState.scannedBookID).get()
      var isReturn = ""
      if(returnRef.docs.lenght == 0){
         isStudentEligable = true
      }
      else{
        isStudentEligable = false
        Alert.alert("the student is not eligable")
        this.setState({
          scannedBookID:"",
          scannedStudentID:""
        })
       }
      }
    

    handleTransaction = async() => {
      var transactionMessage;
      /*db.collection("books").doc(this.state.scannedBookID).get()
      .then((doc)=>{
        var book  = doc.data()
        if(book.bookAvailability){
          this.initiateBookIssue()
          transactionMessage = "Book Issued"
          ToastAndroid.show(transactionMessage,ToastAndroid.SHORT);
        }

        else{
          this.initiateBookReturn()
          transactionMessage = "Book Returned"
          ToastAndroid.show(transactionMessage,ToastAndroid.SHORT);
        }

      })
      this.setState({
        transactionMessage:transactionMessage
      })*/

      var transactionType = await this.checkBookEligibility();
      console.log("transactionType",transactionType);
      if(!transactionType){
        Alert.alert("This book is not there ")
        this.setState({
          scannedBookID:"",
          scannedStudentID:"",
        })
      }

      else if(transactionType === "issue"){
        var isStudentEligable = await this.checkStudentEligabilityForBookIssue()
        if(isStudentEligable){
          this.initiateBookIssue()
          Alert.alert("Book issued to the student")
        }
      }
      
      else{
        var isStudentEligable = await this.checkStudentEligabilityForBookReturn()
        this.initiateBookRuturn()
        Alert.alert("The book has been returned to the library")
      }

    }

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState === "clicked" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView
          behavior = "padding" enabled
          >

          <View style={styles.container}>
          <TextInput
           placeholder = "BookID"
           onChangeText = {text=>this.setState({scannedBookID:text})}
           value = {this.state.scannedBookID}
          />

          <TextInput
           placeholder = "StudentID"
           onChangeText = {text=>this.setState({scannedStudentID:text})}
           value = {this.state.scannedStudentID}
          />



          <Text style={styles.displayText}>{
            hasCameraPermissions===true ? this.state.scannedData: "Request Camera Permission"
          }</Text>     

          <TouchableOpacity
            onPress={this.getCameraPermissions}
            style={styles.scanButton}>
            <Text style={styles.buttonText}>Scan QR Code</Text>
          </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 20,
    }
  });