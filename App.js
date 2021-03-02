import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableWithoutFeedback, TextInput, Button, LogBox } from 'react-native';
import Bird from './components/Bird'
import Obstacles from './components/Obstacles'
import * as Network from 'expo-network';
import * as firebase from 'firebase'


// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyBryU57U8L8ktPYgwXvNhlfq1eitKbS3iU",
  authDomain: "flappybird-ac50b.firebaseapp.com",
  databaseURL: "https://flappybird-ac50b-default-rtdb.firebaseio.com",
  projectId: "flappybird-ac50b",
  storageBucket: "flappybird-ac50b.appspot.com",
  messagingSenderId: "763652029007",
  appId: "1:763652029007:web:bd63445dc0e5c7a7ae083a"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default function App() {
  const screenWidth = Dimensions.get("screen").width
  const screenHeight = Dimensions.get("screen").height
  const birdLeft = screenWidth / 2
  const [birdBottom, setBirdBottom]= useState(screenHeight / 2)
  const [obstaclesLeft, setObstaclesLeft]= useState(screenWidth)
  const [obstaclesLeftTwo, setObstaclesLeftTwo]= useState(screenWidth + screenWidth/2 + 30)
  const [obstaclesNegHeight, setObstaclesNegHeight]= useState(0)
  const [obstaclesNegHeightTwo, setObstaclesNegHeightTwo]= useState(0)
  const [isGameOver, setIsGameOver]= useState(false)
  const [score, setScore]= useState(0)
  const [registerState, setRegState] = useState({
    showNav: true,
    showMsg: false,
    color: "pink",
    msg: "",
  });
  const gravity = 3
  let obstacleWidth = 60
  let obstacleHeight = 300
  let gap = 200
  let gameTimerId
  let obstaclesTimerId
  let obstaclesTimerIdTwo
  let userName = null

  useEffect(() => {
    LogBox.ignoreLogs(['Setting a timer']);
    tryLogin();
  }, []);
  
  async function tryLogin() {
    setRegState({
      ...registerState,
      showMsg: true,
      color: "orange",
      msg: "Dude Loading..."
    })
    const macAddress = await Network.getMacAddressAsync("wlan0");
    if (macAddress) {
      firebase
        .auth()
        .signInWithEmailAndPassword("doesnt@matter.com", macAddress)
        .then(() => {
          setRegState({
            showNav: false,
            showMsg: true,
            color: "yellow",
            msg: "Login Success",
          });
        })
        .catch((err) => {
          setRegState({
            ...registerState,
            showMsg: true,
            color: "pink",
            msg: "You are not registered honey",
          })
        });
    }
  }

  async function register() {
    const macAddress = await Network.getMacAddressAsync("wlan0");
    userName
    ? firebase
      .database()
      .ref('users')
      .orderByChild("userName")
      .equalTo(userName)
      .once("value")
      .then(snapshot => {
        if (!snapshot.exists() && (userName !== "") && !userName.includes(" ") && macAddress) {// if null then unique
          firebase
          .auth()
          .createUserWithEmailAndPassword("doesnt@matter.com", macAddress)
          .then((arg) => {
            const user = {
              userName: userName,
              highestScore: 0,
            };
            firebase
              .database()
              .ref('users/' + arg.user?.uid)
              .update(user)
              .then(snapshot => {
                setRegState({
                  ...registerState,
                  showNav: false
                })
              })
              .catch(err => {
                console.log("SIGN UP FAILED", err);
              })
          })
          .catch((err) => {
            console.log(err)
          });
        } else {
          setRegState({
            ...registerState,
            showMsg: true,
            color: "pink",
            msg: "Maybe user name already exist honey",
          })
        }
      })
      .catch((err) => console.log(err))
    : setRegState({
        ...registerState,
        showMsg: true,
        color: "pink",
        msg: "Invalid user name honey",
      })
  }






    //  //start bird falling
    //  useEffect(() => {
    //   if (birdBottom > 0) {
    //     gameTimerId = setInterval(() => {
    //       setBirdBottom(birdBottom => birdBottom - gravity)
    //     },30)
    
    //     return () => {
    //       clearInterval(gameTimerId)
    //     }
    //   }
    //   //if i dont have birdBottom as a dependecy, it wont stop
    // }, [birdBottom])

    // const jump = () => {
    //   if (!isGameOver && (birdBottom < screenHeight)) {
    //     setBirdBottom(birdBottom => birdBottom + 50)
    //   }
    // }

    // //start first obstacle
    // useEffect(() => {
    //   if (obstaclesLeft > -60) {
    //     obstaclesTimerId = setInterval(() => {
    //       setObstaclesLeft(obstaclesLeft => obstaclesLeft - 5)
    //     }, 30)
    //     return () => {
    //       clearInterval(obstaclesTimerId)
    //     }
    //   } else {
    //     setScore(score => score +1)
    //     setObstaclesLeft(screenWidth)
    //     setObstaclesNegHeight( - Math.random() * 100)
    //   }
    // }, [obstaclesLeft])

    // //start second obstacle
    // useEffect(() => {
    //   if (obstaclesLeftTwo > -60) {
    //     obstaclesTimerIdTwo = setInterval(() => {
    //       setObstaclesLeftTwo(obstaclesLeftTwo => obstaclesLeftTwo - 5)
    //     }, 30)
    //       return () => {
    //         clearInterval(obstaclesTimerIdTwo)
    //       }
    //     } else {
    //         setScore(score => score +1)
    //         setObstaclesLeftTwo(screenWidth)
    //         setObstaclesNegHeightTwo( - Math.random() * 100)
    //       }
    // }, [obstaclesLeftTwo])

    // //check for collisions
    // useEffect(() => {
    //   if (
    //     ((birdBottom < (obstaclesNegHeight + obstacleHeight + 30) ||
    //     birdBottom > (obstaclesNegHeight + obstacleHeight + gap -30)) &&
    //     (obstaclesLeft > screenWidth/2 -30 && obstaclesLeft < screenWidth/2 + 30 )
    //     )
    //     || 
    //     ((birdBottom < (obstaclesNegHeightTwo + obstacleHeight + 30) ||
    //     birdBottom > (obstaclesNegHeightTwo + obstacleHeight + gap -30)) &&
    //     (obstaclesLeftTwo > screenWidth/2 -30 && obstaclesLeftTwo < screenWidth/2 + 30 )
    //     )
    //     ) 
    //     {
    //     gameOver()
    //   }
    // })









    //start bird falling
    useEffect(() => {
      if (!registerState.showNav) {
        if (birdBottom > 0) {
          gameTimerId = setInterval(() => {
            setBirdBottom(birdBottom => birdBottom - gravity)
          },30)

          return () => {
            clearInterval(gameTimerId)
          }
        }
        //if i dont have birdBottom as a dependecy, it wont stop
      }
    }, [birdBottom, registerState.showNav])

    //start first obstacle
    useEffect(() => {
      if (!registerState.showNav) {
        console.log("first")
        if (obstaclesLeft > -60) {
          obstaclesTimerId = setInterval(() => {
            setObstaclesLeft(obstaclesLeft => obstaclesLeft - 5)
          }, 30)
          return () => {
            clearInterval(obstaclesTimerId)
          }
        } else {
          setScore(score => score +1)
          setObstaclesLeft(screenWidth)
          setObstaclesNegHeight( - Math.random() * 100)
        }
      }
    }, [obstaclesLeft, registerState.showNav]);

     //start second obstacle
    useEffect(() => {
      if (!registerState.showNav) {
        console.log("second")
        if (obstaclesLeftTwo > -60) {
          obstaclesTimerIdTwo = setInterval(() => {
            setObstaclesLeftTwo(obstaclesLeftTwo => obstaclesLeftTwo - 5)
          }, 30)
            return () => {
              clearInterval(obstaclesTimerIdTwo)
            }
        } else {
            setScore(score => score +1)
            setObstaclesLeftTwo(screenWidth)
            setObstaclesNegHeightTwo( - Math.random() * 100)
          }
      }
    }, [obstaclesLeftTwo, registerState.showNav]);

    //check for collisions
    useEffect(() => {
      if (!registerState.showNav) {
        console.log("collission")
        if (
          ((birdBottom < (obstaclesNegHeight + obstacleHeight + 30) ||
          birdBottom > (obstaclesNegHeight + obstacleHeight + gap -30)) &&
          (obstaclesLeft > screenWidth/2 -30 && obstaclesLeft < screenWidth/2 + 30 )
          )
          || 
          ((birdBottom < (obstaclesNegHeightTwo + obstacleHeight + 30) ||
          birdBottom > (obstaclesNegHeightTwo + obstacleHeight + gap -30)) &&
          (obstaclesLeftTwo > screenWidth/2 -30 && obstaclesLeftTwo < screenWidth/2 + 30 )
          )
          ) 
          {
          gameOver()
        }
      }
    })





   const jump = () => {
      if (!isGameOver && (birdBottom < screenHeight)) {
        setBirdBottom(birdBottom => birdBottom + 50)
      }
    }

    const gameOver = () => {
      clearInterval(gameTimerId)
      clearInterval(obstaclesTimerId)
      clearInterval(obstaclesTimerIdTwo)
      setIsGameOver(true)
    }
  
  return (
    registerState.showNav
    ? <View style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "green",
      }}>
        { registerState.showMsg && <Text style={{
          width: "100%",
          color: "red",
          textAlign: "center",
          backgroundColor: registerState.color
        }}>{registerState.msg}</Text> }
        <TextInput
          onChangeText={(text => userName = text)}
          placeholder="User Name"
          style={{
            width: "80%",
            fontSize: 30,
            textAlign: "center",
            borderWidth: 3,
            borderColor: "gray",
            backgroundColor: "white",
          }}></TextInput>
          <Button 
            onPress={() => register()}
            title="Enter baby"></Button>
      </View>
    : <TouchableWithoutFeedback onPress={jump}>
      <View style={styles.container}>
        {
          isGameOver &&
          <View style={{ 
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "100%",
            zIndex: 999999,
          }}>
            <Text style={{fontSize: 30}}>{score}</Text>
          </View>
        }
        <Bird 
          birdBottom = {birdBottom} 
          birdLeft = {birdLeft}
        />
        <Obstacles 
          color={'green'}
          obstacleWidth = {obstacleWidth}
          obstacleHeight = {obstacleHeight}
          randomBottom = {obstaclesNegHeight}
          gap = {gap}
          obstaclesLeft = {obstaclesLeft}
        />
        <Obstacles 
          color={'yellow'}
          obstacleWidth = {obstacleWidth}
          obstacleHeight = {obstacleHeight}
          randomBottom = {obstaclesNegHeightTwo}
          gap = {gap}
          obstaclesLeft = {obstaclesLeftTwo}
        />
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
  },
})


export { firebase };