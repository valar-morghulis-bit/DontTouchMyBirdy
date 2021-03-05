import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableWithoutFeedback, TextInput, Button, LogBox, StatusBar, FlatList, ImageBackground } from 'react-native';
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
  const [menu, setMenu] = useState({
    active: false,
    records: null,
    hallOffame: []
  })
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
    console.log(macAddress)
    if (macAddress) {
      firebase
        .database()
        .ref('users')
        .child(macAddress)
        .once("value")
        .then(snapshot => {
          if(snapshot.exists()) {
            setRegState({
              ...registerState,
              showNav: false
            })
          } else {
            setRegState({
              ...registerState,
              showMsg: true,
              color: "pink",
              msg: "You are not registered honey",
            })
          }
        })
        .catch(err => console.log(err))
    }
  }

  async function register() {
    setRegState({
      ...registerState,
      showMsg: true,
      color: "orange",
      msg: "Dude Loading..."
    })
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
          const user = {
            userName: userName,
            highestScore: 0,
          };
          firebase
            .database()
            .ref('users/' + macAddress)
            .update(user)
            .then(snapshot => {
              setRegState({
                ...registerState,
                showNav: false
              });
            })
            .catch(err => {
              console.log("SIGN UP FAILED", err);
            })
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

  const getRecords = () => {
    firebase
      .database()
      .ref('/users')
      .once('value')
      .then(snapshot => {
        records = snapshot.val();
        const arr = Object.keys(records).sort((a,b) => records[b].highestScore - records[a].highestScore);
        setMenu({
          active: true,
          records: records,
          hallOffame: arr
        });
      })
  }

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
        isNewScore()
      }
    }
  })

  const jump = () => {
    if (!isGameOver && (birdBottom < screenHeight) && !registerState.showNav) {
      setBirdBottom(birdBottom => birdBottom + 50)
    }
  }


  let overOnce = true
  async function isNewScore() {
    const macAddress = await Network.getMacAddressAsync("wlan0");

    getRecords();

    const clear = setInterval(() => {
      if (menu.records && overOnce) {
        const recordedScore = menu.records[macAddress]
        if (score > recordedScore.highestScore) {
          firebase
            .database()
            .ref('users/' + macAddress)
            .update({ highestScore: score })
        }
        clearInterval(clear);
        overOnce = false;
      }
      if (!overOnce) {
        clearInterval(clear);
      }
    }, 1000)
    
  }

  const gameOver = () => {
    clearInterval(gameTimerId)
    clearInterval(obstaclesTimerId)
    clearInterval(obstaclesTimerIdTwo)
    setIsGameOver(true)
  }



  const openMenu = () => {
    getRecords();
    setRegState({
      ...registerState,
      showNav: true,
    });
  }

  const closeMenu = () => {
    setRegState({
      ...registerState,
      showNav: false,
    });
  }
  
  return (
    registerState.showNav
    ? <View style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        // justifyContent: "center",
        // alignItems: "center",
      }}>
        <ImageBackground
          source={require("./assets/bg.png")}
          style={{
            width: "100%",
            height: "100%",
            resizeMode: "cover",
            justifyContent: "center",
            alignItems: "center",
          }}>
        {
          !menu.active
          ? <>
              { 
                registerState.showMsg && 
                  <Text style={{
                    width: "100%",
                    color: "red",
                    textAlign: "center",
                    backgroundColor: registerState.color
                  }}>{registerState.msg}</Text> 
              }
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
            </>
          : <>
              <Button 
                onPress={() => closeMenu()}
                title={"Back"}
               />
              <FlatList
                data={menu.hallOffame}
                renderItem={({ item }) => {
                  return (
                    menu.records
                    ? <View style={{
                        justifyContent: "center",
                        flexDirection: "row",
                        borderTopWidth: 1,
                        borderColor: "#e0e0e0",
                        backgroundColor: "orange", 
                        paddingTop: 10,
                        paddingBottom: 10,
                        width: 200
                      }}>
                        <Text style={{ 
                          fontSize: 18, 
                          color: "white", 
                        }}>{menu.records[item].userName}:</Text>
                        <Text style={{ 
                          marginLeft: 10,
                          fontSize: 20, 
                          color: "white", 
                          fontStyle: "italic",
                          fontWeight: "bold",
                        }}>{menu.records[item].highestScore}</Text>
                      </View>
                    : null
                  );
                }}
                keyExtractor={(item, index) => index.toString()} />
              <StatusBar hidden={true}></StatusBar>
            </>
        }
        </ImageBackground>
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
        <Button
          onPress={() => openMenu()}
          title="Menu"
          style={{
            position: "absolute",
            top: 0,
            zIndex: 99999,
          }}
        />
        <ImageBackground
          source={require("./assets/bg.png")}
          style={{
            flex: 1,
            resizeMode: "cover",
            justifyContent: "center"
          }}>
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
        </ImageBackground>
        <StatusBar hidden={true}></StatusBar>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'red',
  },
})


export { firebase };