// index.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';

interface Student {
  id: number;
  name: string;
  email: string;
  enrollment_date: string;
}

export default function IndexScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://robotics-api.onrender.com/students')
      .then(response => {
        setStudents(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const handleStudentPress = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleBackPress = () => {
    setSelectedStudent(null);
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (selectedStudent) {
    // Detalles del estudiante seleccionado
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <View style={styles.detailsContainer}>
          <Image
            source={{ uri: `https://ui-avatars.com/api/?name=${selectedStudent.name}&background=random` }}
            style={styles.avatarLarge}
          />
          <Text style={styles.title}>{selectedStudent.name}</Text>
          <Text style={styles.detail}>Email: {selectedStudent.email}</Text>
          <Text style={styles.detail}>Fecha de inscripción: {selectedStudent.enrollment_date}</Text>
        </View>
      </View>
    );
  }

  // Lista de estudiantes
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Estudiantes</Text>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.itemContainer} onPress={() => handleStudentPress(item)}>
            <Image
              source={{ uri: `https://ui-avatars.com/api/?name=${item.name}&background=random` }}
              style={styles.avatar}
            />
            <View style={styles.textContainer}>
              <Text style={styles.itemText}>{item.name}</Text>
              <Text style={styles.itemSubText}>{item.email}</Text>
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  detail: {
    fontSize: 18,
    marginVertical: 8,
  },
});
