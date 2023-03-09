import React, { useState } from "react";
import { StyleSheet, View, Text, Button, Image, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { db, onValue, ref, set, auth } from "../firebase";
import { alert } from "../utility";
import SelectDropdown from 'react-native-select-dropdown'

const WaitingList = ({ route, navigation }) => {

    const UID = route.params;
    const [jobs, setJobs] = useState([]);
    const [numInQueue, setNumInQueue] = useState(0);
    const [time, setTime] = useState(0);

    const loginNavigate = () => {
        navigation.navigate('Login');
    }

    React.useEffect(() => { // Called when tab is focused
        const unsubscribe = navigation.addListener('focus', () => {
            if (UID) {

                onValue(ref(db, "users/" + UID), (snapshot) => { // listener that runs when attached and when value is changed
                    const user = snapshot.val();
                    const allJobs = (user.activeJobs?.length) ? user.activeJobs : [];
                    if (user.inactiveJobs?.length) allJobs.concat(user.inactiveJobs);

                    let jobList = [];

                    for (let jobId of allJobs) {
                        onValue(ref(db, `jobs/${jobId}`), snapShot => {
                            const job = snapShot.val();

                            job.active = job.active ? 'Active' : 'Inactive';
                            let jobDescrip = ['type', 'description', 'active'];
                            jobDescrip = jobDescrip.map(prop => job[prop]);

                            const jobObj = {
                                descrip: jobDescrip.join(' - '),
                                techID: job['techID'],
                                jobID: jobId,
                            }
                            jobList.push(jobObj);
                            setJobs(jobList);
                        });
                    }
                });
            }
        });
    
        return unsubscribe;
      }, [navigation, UID]);

      const onSelectJob = (selectedItem, index) => {

        const { techID, jobID } = jobs[index];

        onValue(ref(db, "technicians/" + techID), (snapshot) => {
            const tech = snapshot.val();
            const queueNum = tech?.jobsInQueue.findIndex((id) => id == jobID) ?? 0;
            if (queueNum != -1) {
                setNumInQueue(String(queueNum));
                const t = Number(tech.aveTimePerClient) * Number(queueNum)
                setTime((t == 0) ? 'Very soon' : (t == 1) ? '1 day' : t + ' days');
            } else { // no client found in technician's queue
                alert("You appear to not be in your technician's queue", 
                    "If not serviced yet, please call 918-933-3436 and we place you accordingly."
                    + "If so, thank you so much for allowing us to serve you!");
            }
        });
      }

    return (
        <View style={styles.container}>
            <Image 
                style={styles.logo} 
                source={require("../../assets/icons/3rd Gen Plumbing logo.png")}
                blurRadius={Platform.OS == 'web' ? 4.5 : 10} 
            />
            <View style={styles.dropdownContainer}>
                <SelectDropdown
                    defaultButtonText='Select a job'
                    buttonStyle={styles.dropdown}
                    onSelect={onSelectJob}
                    data={jobs.map(jobObj => jobObj.descrip)}
                />
            </View>
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
    dropdownContainer: {
        position: 'absolute',
        top: '15%',
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        zIndex: 2,
    },
    dropdown: {
        borderRadius: 3,
        borderCurve: 3,
        backgroundColor: 'white'
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
        zIndex: 3,
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
        backgroundColor: '#23245c',
    },
});
  
export default WaitingList;