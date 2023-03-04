import React, { useState } from "react";
import { StyleSheet, Text, Button, View, TextInput, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import HelpIcon from 'react-native-vector-icons/AntDesign';
import { app, analytics, auth, signInWithEmailAndPassword } from '../Firebase/firebase.js';

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
            alert("Please enter a valid email.", "", [
                {
                    text: "Ok",
                    onPress: () => console.log("Ok Pressed"),
                }
            ]);
            return;
        }

        setButtonText('Authenticating');

        // Checks user credentials with firebase
        let user = null, errorCode = '', errorMessage = '';
        signInWithEmailAndPassword(auth, email, code)
            .then((userCredential) => { // firebase has authorized user
                user = userCredential.user;

                setButtonText('Show Place In Queue');
                navigation.navigate('Waiting List', user.uid);
            })
            .catch((error) => { // error finding user
                errorCode = error.code;
                errorMessage = error.message;
                console.log(errorMessage);
                console.log(errorMessage.indexOf('auth/network-request-failed'));
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

    // Utility function for showing alerts
    function alert(mobileTitle, message, mobileButtons) {
        if (Platform.OS !== 'web') { // Alert for mobile
            Alert.alert(
                mobileTitle,
                message,
                mobileButtons
            );
        } else { // Alert for web
            window.confirm(mobileTitle + "\n" + message);
        }
    } 

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image style={styles.logo} source={require("../assets/icons/3rd Gen Plumbing banner noBorder.png")} />
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
                    <TextInput value={code} style={styles.textInput} placeholder="Order Code or Password" onChangeText={updateCode}/>
                    <TouchableOpacity style={styles.helpIconContainer} onPress={helpNavigate}>
                        <Image 
                            style={styles.helpIcon} 
                            source={require("../assets/icons/helpIcon2.png")}
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
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
    },
    helpIcon: {
        width: 20,
        height: 20,
    },
});

export default Login;