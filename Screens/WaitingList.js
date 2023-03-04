import React, { useState } from "react";
import { StyleSheet, View, Text, Button, Image, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { db, onValue, ref } from "../Firebase/firebase";

const WaitingList = ({ route, navigation }) => {

    const UID = route.params;
    const [numInQueue, setNumInQueue] = useState(0);
    const [time, setTime] = useState(0);

    const loginNavigate = () => {
        navigation.navigate('Login');
    }

    React.useEffect(() => { // unmemoized, called when tab is focused
        const unsubscribe = navigation.addListener('focus', () => {
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
        });
    
        return unsubscribe;
      }, [navigation, UID]);

    // useFocusEffect(
    //     React.useCallback(() => { // Screen focused, memoized results (should change)
    //         if (UID) {
    //             const techIDRef = ref(db, "users/" + UID);
    //             onValue(techIDRef, (snapshot) => { // listener that runs when attached and when value is changed
    //                 const techID = snapshot.val();
    //                 const techRef = ref(db, "technicians/" + techID);
    //                 onValue(techRef, (snapshot) => {
    //                     const techObj = snapshot.val();
    //                     const queueNum = techObj.clientsInQueue.findIndex((val) => val == UID);
    //                     if (queueNum != -1) {
    //                         setNumInQueue(String(queueNum));
    //                         const t = Number(techObj.aveTimePerClient) * Number(queueNum)
    //                         setTime((t == 0) ? 'Very soon' : (t == 1) ? '1 day' : t + ' days');
    //                     } else { // no client found in technician's queue

    //                     }
    //                 });
    //             });
    //         }

    //         return () => { // Screen unfocused
                
    //         }
    //     }, [UID])
    // );

    return (
        <View style={styles.container}>
            <Image 
                style={styles.logo} 
                source={require("../assets/icons/3rd Gen Plumbing logo.png")}
                blurRadius={Platform.OS == 'web' ? 4.5 : 8} 
            />
            <View style={styles.info}>
                <Text style={styles.place}>
                    <Text style={styles.number}>{numInQueue}</Text> 
                    {numInQueue == 1 ? ' client' : ' clients'} ahead</Text>
                <Text style={styles.time}>Estimated time: {time}</Text>
            </View>
            <View style={styles.diffCodeContainer}>
                <Button 
                    style={styles.diffCode}
                    underlayColor='#F25822'
                    color="#F25822"
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
    diffCodeContainer: {
        position: 'absolute',
        top: '90%',
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
    },
    diffCode: {
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
        zIndex: -1,
    },
});
  
export default WaitingList;