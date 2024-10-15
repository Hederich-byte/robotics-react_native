import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Image,
  TextInput,
  Button,
  Alert
} from "react-native";
import axios from "axios";

interface Student {
  id: number;
  name: string;
  email: string;
  enrollment_date: string;
}

interface Course {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
}

export default function IndexScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentEnrollmentDate, setNewStudentEnrollmentDate] = useState("");
  const [updatedName, setUpdatedName] = useState("");
  const [updatedEmail, setUpdatedEmail] = useState("");
  const [updatedEnrollmentDate, setUpdatedEnrollmentDate] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [updating, setUpdating] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    axios
      .get("https://robotics-api.onrender.com/students")
      .then((response) => {
        setStudents(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const handleStudentPress = (student: Student) => {
    setSelectedStudent(student);
    fetchEnrolledCourses(student.id);
  };

  const fetchEnrolledCourses = (studentId: number) => {
    axios
      .get(`https://robotics-api.onrender.com/students/${studentId}/courses`)
      .then((response) => {
        setEnrolledCourses(response.data);
      })
      .catch((error) => {
        console.error(error);
        Alert.alert("Error", "No se pudieron cargar los cursos del estudiante");
      });
  };

  const handleBackPress = () => {
    setSelectedStudent(null);
  };

  const handleAddStudent = () => {
    if (!newStudentName || !newStudentEmail || !newStudentEnrollmentDate) {
      Alert.alert("Error", "Por favor, completa todos los campos");
      return;
    }

    setAdding(true);

    axios
      .post("https://robotics-api.onrender.com/students", {
        name: newStudentName,
        email: newStudentEmail,
        enrollment_date: newStudentEnrollmentDate
      })
      .then((response) => {
        setStudents([...students, response.data]);
        setNewStudentName("");
        setNewStudentEmail("");
        setNewStudentEnrollmentDate("");
        Alert.alert("Éxito", "Estudiante agregado correctamente");
      })
      .catch((error) => {
        console.error(error);
        Alert.alert("Error", "No se pudo agregar el estudiante");
      })
      .finally(() => {
        setAdding(false);
      });
  };

  const handleUpdateStudent = (id: number) => {
    if (!updatedName && !updatedEmail && !updatedEnrollmentDate) {
      alert("Por favor, ingresa al menos un campo para actualizar");
      return;
    }

    setUpdating(true);
    axios
      .put(`https://robotics-api.onrender.com/students/${id}`, {
        name: updatedName || selectedStudent?.name,
        email: updatedEmail || selectedStudent?.email,
        enrollment_date:
          updatedEnrollmentDate || selectedStudent?.enrollment_date
      })
      .then((response) => {
        const updatedStudents = students.map((student) =>
          student.id === id ? response.data : student
        );
        setStudents(updatedStudents);

        setSelectedStudent(response.data);

        setUpdatedName("");
        setUpdatedEmail("");
        setUpdatedEnrollmentDate("");

        Alert.alert("Éxito", "Estudiante actualizado correctamente");
      })
      .catch((error) => {
        console.error(error);
        alert("Error al actualizar el estudiante");
      })
      .finally(() => {
        setUpdating(false);
      });
  };

  const handleDeleteStudent = (id: number) => {
    Alert.alert(
      "Confirmación",
      "¿Estás seguro de que deseas eliminar este estudiante?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => confirmDeleteStudent(id)
        }
      ]
    );
  };

  const confirmDeleteStudent = (id: number) => {
    axios
      .delete(`https://robotics-api.onrender.com/students/${id}`)
      .then(() => {
        const filteredStudents = students.filter(
          (student) => student.id !== id
        );
        setStudents(filteredStudents);
        setSelectedStudent(null);
        Alert.alert("Éxito", "Estudiante eliminado correctamente");
      })
      .catch((error) => {
        console.error(error);
        Alert.alert("Error", "No se pudo eliminar el estudiante");
      });
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (selectedStudent) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <FlatList
          data={[selectedStudent]}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View>
              <View style={styles.detailsContainer}>
                <Image
                  source={{
                    uri: `https://ui-avatars.com/api/?name=${item.name}&background=random`
                  }}
                  style={styles.avatarLarge}
                />
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.detail}>Email: {item.email}</Text>
                <Text style={styles.detail}>
                  Fecha de inscripción: {item.enrollment_date}
                </Text>

                <Text style={styles.subHeader}>Actualizar Información</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Nombre actualizado"
                  value={updatedName}
                  onChangeText={setUpdatedName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email actualizado"
                  value={updatedEmail}
                  onChangeText={setUpdatedEmail}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Fecha de inscripción actualizada"
                  value={updatedEnrollmentDate}
                  onChangeText={setUpdatedEnrollmentDate}
                />
                <Button
                  title={updating ? "Actualizando..." : "Actualizar Estudiante"}
                  onPress={() => handleUpdateStudent(selectedStudent.id)}
                  disabled={updating}
                />
              </View>

              <Text style={styles.subHeader}>Cursos Inscritos</Text>
              {enrolledCourses.length === 0 ? (
                <Text style={styles.noCoursesText}>
                  Este estudiante no está inscrito en ningún curso.
                </Text>
              ) : (
                <FlatList
                  data={enrolledCourses}
                  keyExtractor={(course) => course.id.toString()}
                  renderItem={({ item: course }) => (
                    <View style={styles.courseItemContainer}>
                      <Text style={styles.itemText}>{course.name}</Text>
                      <Text style={styles.itemSubText}>
                        {course.description}
                      </Text>
                    </View>
                  )}
                  nestedScrollEnabled={true}
                />
              )}
            </View>
          )}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Estudiantes</Text>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => handleStudentPress(item)}
          >
            <Image
              source={{
                uri: `https://ui-avatars.com/api/?name=${item.name}&background=random`
              }}
              style={styles.avatar}
            />
            <View style={styles.textContainer}>
              <Text style={styles.itemText}>{item.name}</Text>
              <Text style={styles.itemSubText}>{item.email}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <View style={styles.formContainer}>
        <Text style={styles.subHeader}>Agregar Nuevo Estudiante</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre del estudiante"
          value={newStudentName}
          onChangeText={setNewStudentName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={newStudentEmail}
          onChangeText={setNewStudentEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Fecha de inscripción (YYYY-MM-DD)"
          value={newStudentEnrollmentDate}
          onChangeText={setNewStudentEnrollmentDate}
        />
        <Button
          title={adding ? "Agregando..." : "Agregar estudiante"}
          onPress={handleAddStudent}
          disabled={adding}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  noCoursesText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginVertical: 10
  },
  courseItemContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd"
  },
  subHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#6200ee",
    textAlign: "center"
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7f7f7"
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#6200ee",
    alignSelf: "center"
  },
  itemContainer: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5
  },
  textContainer: {
    marginLeft: 12,
    flex: 1
  },
  itemText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333"
  },
  itemSubText: {
    fontSize: 14,
    color: "#666"
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24
  },
  backButton: {
    marginBottom: 16,
    padding: 8,
    backgroundColor: "#6200ee",
    borderRadius: 8
  },
  backButtonText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center"
  },
  detailsContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center"
  },
  detail: {
    fontSize: 16,
    marginVertical: 8,
    color: "#666",
    textAlign: "center"
  },
  input: {
    borderColor: "#ddd",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    width: "100%"
  },
  formContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5
  }
});
