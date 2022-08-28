import react, {useState} from "react";
import { StyleSheet, Text, Button, View, TextInput, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import HelpIcon from 'react-native-vector-icons/AntDesign';
import { app, analytics, auth, signInWithEmailAndPassword } from '../Firebase/firebase.js';
import { database } from "../Firebase/firebase.js";

const Login = ({ navigation }) => {

    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [buttonText, setButtonText] = useState('Show Place In Line');

    function helpNavigate () {
        navigation.navigate('Help');
    }

    const updateCode = (value) => {
        setCode(value);
    }

    const updateEmail = (value) => {
        setEmail(value);
    }

    const checkUser = () => {

        const valid = /^[\w.]+@\w+\.\w+$/.test(email);

        if (!valid) { // If not valid
            alert("Please enter a valid email.", "", [{
                    text: "Ok",
                    onPress: () => console.log("Ok Pressed"),
                }
            ]);
            return;
        }

        setButtonText('Authenticating');

        let user = null, errorCode = '', errorMessage = '';
        signInWithEmailAndPassword(auth, email, code)
            .then((userCredential) => {
                user = userCredential.user;

                navigation.navigate('Waiting List');
            })
            .catch((error) => {
                errorCode = error.code;
                errorMessage = error.message;
                console.log(errorMessage);
                const title = errorMessage.indexOf('auth/network-request-failed') ? 'Network Error' :
                    "Client Not Found"; // 'auth/wrong-password' error
                const message = errorMessage.indexOf('auth/network-request-failed') ? 
                    "There appears to be no internet."
                    : "We can't find an email that matches with your code, unfortunately. Please try again "
                        + "or call us at 111-223-4455."
                const mobileButtons = [
                    {
                        text: "Try Again",
                        onPress: () => console.log("Try Again Pressed"),
                    }
                ];

                alert(title, message, mobileButtons);
            });
    }

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
            <Text style={styles.header}>Login</Text>
            <View style={styles.inputs}>
                <TextInput value={email} style={styles.textInput} placeholder="E-mail" onChangeText={updateEmail}/>
                <View style={styles.codeInput}>
                    <TextInput value={code} style={styles.textInput} placeholder="Code or Password" onChangeText={updateCode}/>
                    <HelpIcon style={styles.icon} name="questioncircleo" size={20} onPress={helpNavigate}/>
                </View>
            </View>
            <View style={styles.buttons}>
                <Button
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
      alignItems: 'center',
      justifyContent: 'center',
    },
    header: {
        fontSize: 40,
        fontWeight: 'bold',
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
    },
    buttons: {
        margin: 20,
        flexDirection: 'row'
    },
    icon: {
        position: 'absolute',
        left: '100%',
        padding: 8,
    },
});

export default Login;