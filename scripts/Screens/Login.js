import React, { useState } from "react";
import { StyleSheet, Text, Button, View, TextInput, Image, TouchableOpacity, Alert, Platform,
    KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import HelpIcon from 'react-native-vector-icons/AntDesign';
import { app, analytics, auth, signInWithEmailAndPassword } from '../firebase.js';
import { alert } from "../utility.js";

const Login = ({ navigation }) => {

    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [buttonText, setButtonText] = useState('Show Place In Queue');

    function helpNavigate () {
        navigation.navigate('Help');
    }

    const updateCode = (value) => {
        setCode(value);
    }

    const updateEmail = (value) => {
        setEmail(value);
    }

    useFocusEffect(
        React.useCallback(() => {
            // Focused

            return () => { // Unfocused
                
            }
        }, [])
    );

    const checkUser = () => {

        // Checks if email is a valid email
        if (!/^[\w.]+@\w+\.\w+$/.test(email)) {
            alert("Please enter a valid email.", "", [{
                    text: "Ok",
                    onPress: () => console.log("Ok Pressed"),
            }]);
            return;
        }

        setButtonText('Authenticating');

        // Checks credentials with Firebase
        signInWithEmailAndPassword(auth, email, code)
            .then((userCredential) => { // Firebase has authenticated user

                const user = userCredential.user;

                setButtonText('Show Place In Queue');
                navigation.navigate('Waiting List', user.uid);

            })
            .catch((error) => { // Error

                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorMessage);
                const title = errorMessage.indexOf('auth/network-request-failed') != -1 ? 'Network Error' :
                    "Client Not Found"; // 'auth/wrong-password' error
                const message = errorMessage.indexOf('auth/network-request-failed') != -1 ? 
                    "There appears to be no internet."
                    : "We can't find an email that matches your password unfortunately. Please try again "
                        + "or call us at (918) 933 3436."
                const mobileButtons = [
                    {
                        text: "Try Again",
                        onPress: () => console.log("Try Again Pressed"),
                    }
                ];

                alert(title, message, mobileButtons);
                setButtonText('Show Place In Queue');
            });
    }

    return (
        <TouchableWithoutFeedback onPress={Platform.OS != 'web' ? Keyboard.dismiss : () => {}}>
            <View style={styles.container}>
                <View style={styles.logoContainer}>
                    <Image style={styles.logo} source={require("../../assets/icons/3rd Gen Plumbing banner noBorder.png")} />
                </View>
                <View style={styles.inputs}>
                    <TextInput 
                        value={email} 
                        style={styles.textInput} 
                        placeholder="E-mail" 
                        onChangeText={updateEmail}
                        autoFocus={true}
                    />
                    <View style={styles.codeInput}>
                        <TextInput 
                            value={code} 
                            style={styles.textInput} 
                            placeholder="Order Code or Password" 
                            onChangeText={updateCode}
                            secureTextEntry={true}
                        />
                        <TouchableOpacity style={styles.helpIconContainer} onPress={helpNavigate}>
                            <Image 
                                style={styles.helpIcon} 
                                source={require("../../assets/icons/helpIcon2.png")}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.buttonContainer}>
                    <Button
                        underlayColor='#F25822'
                        color="#F25822"
                        style={styles.button}
                        title={buttonText}
                        onPress={checkUser}
                    />
                </View>
            </View>
        </TouchableWithoutFeedback>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#23245c',
    },
    logoContainer: {
        position: 'absolute',
        top: 35,
    },
    logo: {
        width: 282,
        height: 115,
    },
    header: {
        fontSize: 40,
        fontWeight: 'bold',
        fontFamily: 'Franklin Gothic',
    },
    inputs: {
        marginTop: 25,
    },
    codeInput: {
        flexDirection: 'row',
    },
    textInput: {
        width: 300,
        height: 40,
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 10,
        position: 'relative',
        fontFamily: 'Franklin Gothic',
        borderRadius: 5,
    },
    buttonContainer: {
        marginTop: 30,
        flexDirection: 'row',
    },
    button: {
        backgroundColor: '#F25822',
        borderColor: '#F25822',
    },
    helpIconContainer: {
        position: 'absolute',
        left: '100%',
        margin: 10,
        marginLeft: Platform.OS != 'web' ? 8 : 10,
        marginRight: Platform.OS != 'web' ? 8 : 10,
    },
    helpIcon: {
        width: 20,
        height: 20,
    },
});

export default Login;