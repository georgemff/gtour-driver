import {StyleSheet, Text, View} from 'react-native';

import {SafeAreaView} from "react-native-safe-area-context";
import {useState} from "react";
import {Ionicons} from "@expo/vector-icons";

export default function HomeScreen() {
  const [isEmpty, setIsEmpty] = useState(true);
  return (
      <SafeAreaView style={styles.safeAreaContainer}>
        {
          isEmpty &&
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Ionicons name="search-sharp" size={48} color="grey" style={{
                marginBottom: 12
              }} />
                <Text style={{
                  fontSize: 22,
                  color: 'grey'
                }}>
                  შეკვეთები არ მოიძებნა
                </Text>
            </View>
        }
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    padding: 16,

  },
});
