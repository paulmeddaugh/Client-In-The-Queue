import react from "react";
import { StyleSheet, View, Text, Linking, Image, Button, TouchableOpacity, Platform } from 'react-native';

const Help = ({ navigation }) => {

    const loginNavigate = () => {
        navigation.navigate('Login');
    }

    return (
        <View style={styles.container}>
            <Image 
                style={styles.logo} 
                source={require("../assets/icons/3rd Gen Plumbing logo.png")} 
                blurRadius={Platform.OS == 'web' ? 4.5 : 8} 
            />
            <View style={styles.textContainer}>
                <Text style={styles.text}>
                    Upon placing a service request, you should have received a confirmation number with your
                    order. This is the number you can use to view your estimated time and number of clients ahead
                    of you to be serviced by the plumber that has been assigned for you.
                </Text>
                <Text style={styles.secondText}>
                    For a missing code or for more help, email us at&nbsp;
                    <TouchableOpacity
                        style={styles.linkContainer}
                        onPress={() => Linking.openURL(`mailto:micah.tilford@3rdgenok.com`)}>
                        <Text style={styles.link}>micah.tilford@3rdgenok.com</Text>
                    </TouchableOpacity>
                    &nbsp;or give us a call at&nbsp;
                    <TouchableOpacity
                        style={styles.linkContainer}
                        onPress={() => Linking.openURL(`tel:${9189333436}`)}>
                        <Text style={styles.link}>(918) 933 3436</Text>
                    </TouchableOpacity>
                    .
                </Text>
                <View style={styles.returnContainer}>
                    <Button
                        style={styles.return}
                        underlayColor='#F25822'
                        color="#F25822"
                        title="Return to Login Screen"
                        onPress={loginNavigate}
                    />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textContainer: {
        width: '100%',
        maxWidth: 500,
        padding: 25,
        position: 'relative',
    },
    text: {
        fontSize: 14,
        textAlign: 'center',
    },
    secondText: {
        fontSize: 14,
        textAlign: 'center',
        margin: 25,
    },
    linkContainer: {
        position: 'relative',
    },
    link: {
        color: 'blue',
        marginBottom: (Platform.OS != 'web') ? -2.5 : 0,
    },
    returnContainer: {
        position: 'absolute',
        top: '100%',
        marginTop: Platform.OS != 'web' ? 20 : 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
    },
    return: {
        backgroundColor: '#F25822',
        borderColor: '#F25822',
    },
    logo: {
        flex: 1,
        resizeMode: "contain",
        position: 'absolute',
        width: '100%',
        height: '100%',
        alignContent: 'center',
        opacity: 0.1,
        //backgroundColor: '#23245c',
    },
});
  
export default Help;