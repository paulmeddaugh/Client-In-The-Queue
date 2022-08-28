import react from "react";
import { StyleSheet, View, Text, Button } from 'react-native';
import { database } from "../Firebase/firebase";

const WaitingList = ({ navigation }) => {

    const loginNavigate = () => {
        navigation.popToTop();
    }

    database()
        .ref('/users/0')
        .once('value')
        .then(snapshot => {
            console.log('User data: ', snapshot.val());
        });

    return (
        <View style={styles.container}>
            <View style={styles.info}>
                <Text style={styles.place}>4th place in line</Text>
                <Text style={styles.time}>Average time: 4 days</Text>
            </View>
            <View style={styles.diffCode}>
                <Button 
                    title="Enter As Different User"
                    onPress={loginNavigate}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
    },
    info: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    place: {
        fontSize: 30,
        fontWeight: 'bold',
    },
    time: {
        marginTop: 20,
        fontSize: 20,
    },
    diffCode: {
        position: 'absolute',
        top: '90%',
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
    }
});
  
export default WaitingList;