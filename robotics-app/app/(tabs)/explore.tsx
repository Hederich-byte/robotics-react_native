// explore.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';

interface Course {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
}

export default function ExploreScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://robotics-api.onrender.com/courses')
      .then(response => {
        setCourses(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const handleCoursePress = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleBackPress = () => {
    setSelectedCourse(null);
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (selectedCourse) {
    // Detalles del curso seleccionado
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <View style={styles.detailsContainer}>
          <Image
            source={{ uri: `https://source.unsplash.com/collection/190727/${selectedCourse.id}` }}
            style={styles.courseImage}
          />
          <Text style={styles.title}>{selectedCourse.name}</Text>
          <Text style={styles.detail}>{selectedCourse.description}</Text>
          <Text style={styles.detail}>Fecha de inicio: {selectedCourse.start_date}</Text>
          <Text style={styles.detail}>Fecha de finalización: {selectedCourse.end_date}</Text>
        </View>
      </View>
    );
  }

  // Lista de cursos
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cursos</Text>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.itemContainer} onPress={() => handleCoursePress(item)}>
            <Image
              source={{ uri: `https://source.unsplash.com/collection/190727/${item.id}` }}
              style={styles.courseThumbnail}
            />
            <View style={styles.textContainer}>
              <Text style={styles.itemText}>{item.name}</Text>
              <Text style={styles.itemSubText}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loaderContainer: {
    flex:1,
    justifyContent: 'center',
    alignItems:'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    alignSelf: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  itemText: {
    fontSize: 18,
  },
  itemSubText: {
    color: '#555',
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6200ee',
  },
  detailsContainer: {
    alignItems: 'center',
  },
  courseThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  courseImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  detail: {
    fontSize: 18,
    marginVertical: 8,
    textAlign: 'center',
  },
});
