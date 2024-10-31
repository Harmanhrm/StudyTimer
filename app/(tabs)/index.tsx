import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Animated,
} from 'react-native';

interface TimerOption {
  id: string;
  name: string;
  workTime: number;
  breakTime: number;
  description: string;
}

const timerOptions: TimerOption[] = [
  {
    id: '1',
    name: 'Classic Pomodoro',
    workTime: 25,
    breakTime: 5,
    description: '25min work + 5min break. The original productivity method.',
  },
  {
    id: '2',
    name: 'Short Focus',
    workTime: 15,
    breakTime: 3,
    description: '15min work + 3min break. Perfect for quick tasks.',
  },
  {
    id: '3',
    name: 'Long Focus',
    workTime: 45,
    breakTime: 15,
    description: '45min work + 15min break. For deep work sessions.',
  },
];

const MAX_SESSIONS = 4;

export default function App() {
  const [selectedTimer, setSelectedTimer] = useState<TimerOption | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [progress] = useState(new Animated.Value(0));

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;
          Animated.timing(progress, {
            toValue: 1 - (newTime / (isBreak ? selectedTimer!.breakTime : selectedTimer!.workTime) / 60),
            duration: 1000,
            useNativeDriver: false,
          }).start();
          return newTime;
        });
      }, 1000);
    } else if (timeRemaining === 0 && isRunning) {
      if (!isBreak) {
        setSessions(prev => prev + 1);
        setIsBreak(true);
        setTimeRemaining(selectedTimer!.breakTime * 60);
      } else {
        setIsBreak(false);
        setIsRunning(false);
        setSelectedTimer(null);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, isBreak]);

  const handleTimerSelect = (timer: TimerOption) => {
    setSelectedTimer(timer);
    setTimeRemaining(timer.workTime * 60);
    setIsRunning(true);
    setIsBreak(false);
  };

  const handlePress = () => {
    setIsRunning(!isRunning);
  };

  const handleLongPress = () => {
    setIsRunning(false);
    setSelectedTimer(null);
    setTimeRemaining(0);
    setIsBreak(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {!selectedTimer ? (
        <ScrollView style={styles.optionsContainer}>
          <Text style={styles.header}>Choose Your Focus Time</Text>
          {timerOptions.map((timer) => (
            <TouchableOpacity
              key={timer.id}
              style={styles.optionCard}
              onPress={() => handleTimerSelect(timer)}
            >
              <Text style={styles.optionTitle}>{timer.name}</Text>
              <Text style={styles.optionTime}>
                {timer.workTime}min work + {timer.breakTime}min break
              </Text>
              <Text style={styles.optionDescription}>{timer.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Pressable
          style={styles.timerContainer}
          onPress={handlePress}
          onLongPress={handleLongPress}
        >
          <Text style={styles.timerStatus}>
            {isBreak ? 'Break Time!' : 'Focus Time'}
          </Text>
          <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
          <Text style={styles.timerAction}>
            {isRunning ? 'Tap to pause' : 'Tap to resume'}
          </Text>
          <Text style={styles.timerHint}>Hold to end session</Text>
          
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </Pressable>
      )}
      
      <View style={styles.sessionTracker}>
        {Array.from({ length: MAX_SESSIONS }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.sessionDot,
              index < sessions && styles.sessionCompleted,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  optionsContainer: {
    padding: 20,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  optionTime: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#888',
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  timerStatus: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 20,
  },
  timerAction: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  timerHint: {
    fontSize: 14,
    color: '#888',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#2196F3',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  sessionTracker: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
    gap: 10,
  },
  sessionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
  },
  sessionCompleted: {
    backgroundColor: '#2196F3',
  },
});