import react from "react";
import { StyleSheet, View, Text } from 'react-native';

const Help = ({ navigation }) => {

    navigation.setOptions({ title: '' });

    return (
        <View style={styles.container}>
            <Text>HelpScreen</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
});
  
export default Help;