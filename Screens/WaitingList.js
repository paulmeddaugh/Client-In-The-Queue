import React, { useState } from "react";
import { StyleSheet, View, Text, Button, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { db, onValue, ref } from "../Firebase/firebase";

const WaitingList = ({ route, navigation }) => {

    const UID = route.params;
    const [numInQueue, setNumInQueue] = useState('');
    const [time, setTime] = useState('');

    const loginNavigate = () => {
        navigation.popToTop();
    }

    useFocusEffect(
        React.useCallback(() => { // Screen focused
            
            if (UID) {
                const techIDRef = ref(db, "users/" + UID);
                onValue(techIDRef, (snapshot) => { // listener that runs when attached and when value is changed
                    const techID = snapshot.val();
                    const techRef = ref(db, "technicians/" + techID);
                    onValue(techRef, (snapshot) => {
                        const techObj = snapshot.val();
                        const queueNum = techObj.clientsInQueue.findIndex((val) => val == UID);
                        if (queueNum != -1) {
                            setNumInQueue(String(queueNum));
                            const t = Number(techObj.aveTimePerClient) * Number(queueNum)
                            setTime((t == 0) ? 'Very soon' : (t == 1) ? '1 day' : t + ' days');
                        } else { // no client found in technician's queue

                        }
                    });
                });
            }

            return () => { // Screen unfocused
                
            }
        }, [])
    );

    return (
        <View style={styles.container}>
            <Image 
                style={styles.logo} 
                source={require("../assets/icons/3rd Gen Plumbing logo.png")}
                blurRadius={5} 
            />
            <View style={styles.info}>
                <Text style={styles.place}>
                    <Text style={styles.number}>{numInQueue}</Text> 
                    {numInQueue == 1 ? ' client' : ' clients'} ahead</Text>
                <Text style={styles.time}>Estimated time: {time}</Text>
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
    number: {
        fontSize: 45,
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
    },
    logo: {
        flex: 1,
        resizeMode: "contain",
        position: 'absolute',
        width: '100%',
        height: '100%',
        alignContent: 'center',
        opacity: 0.1,
        zIndex: -1,
    },
});
  
export default WaitingList;