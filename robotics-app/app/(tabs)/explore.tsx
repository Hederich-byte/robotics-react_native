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
  Alert,
  ScrollView
} from "react-native";
import axios from "axios";

interface Course {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
}

interface ClassSession {
  id: number;
  course_id: number;
  organization_id: number;
  instructor_id: number;
  classroom_id: number;
  session_date: string;
  start_time: string;
  end_time: string;
  student_count: number;
  materials_used: string;
  // Puedes agregar más campos si los necesitas
}

export default function ExploreScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [classSessions, setClassSessions] = useState<ClassSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseDescription, setNewCourseDescription] = useState("");
  const [newCourseStartDate, setNewCourseStartDate] = useState("");
  const [newCourseEndDate, setNewCourseEndDate] = useState("");
  const [updatedName, setUpdatedName] = useState("");
  const [updatedDescription, setUpdatedDescription] = useState("");
  const [updatedStartDate, setUpdatedStartDate] = useState("");
  const [updatedEndDate, setUpdatedEndDate] = useState("");
  const [updating, setUpdating] = useState(false);
  const [adding, setAdding] = useState(false);

  // Estados para manejar las sesiones de clase
  const [newSessionData, setNewSessionData] = useState({
    session_date: "",
    start_time: "",
    end_time: "",
    student_count: "",
    materials_used: ""
    // Puedes agregar más campos si son necesarios
  });
  const [updatingSession, setUpdatingSession] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    setLoading(true);
    axios
      .get("https://robotics-api.onrender.com/courses")
      .then((response) => {
        setCourses(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
        Alert.alert("Error", "No se pudieron cargar los cursos");
      });
  };

  const handleCoursePress = (course: Course) => {
    setSelectedCourse(course);
    fetchClassSessions(course.id);
  };

  const handleBackPress = () => {
    setSelectedCourse(null);
    setClassSessions([]);
  };

  // Función para obtener las sesiones de clase del curso seleccionado
  const fetchClassSessions = (courseId: number) => {
    axios
      .get(
        `https://robotics-api.onrender.com/courses/${courseId}/class_sessions`
      )
      .then((response) => {
        setClassSessions(response.data);
      })
      .catch((error) => {
        console.error(error);
        Alert.alert("Error", "No se pudieron cargar las sesiones de clase");
      });
  };

  const handleAddCourse = () => {
    if (
      !newCourseName ||
      !newCourseDescription ||
      !newCourseStartDate ||
      !newCourseEndDate
    ) {
      Alert.alert("Error", "Por favor, completa todos los campos");
      return;
    }

    setAdding(true);

    axios
      .post("https://robotics-api.onrender.com/courses", {
        name: newCourseName,
        description: newCourseDescription,
        start_date: newCourseStartDate,
        end_date: newCourseEndDate
      })
      .then((response) => {
        setCourses([...courses, response.data]);
        setNewCourseName("");
        setNewCourseDescription("");
        setNewCourseStartDate("");
        setNewCourseEndDate("");
        Alert.alert("Éxito", "Curso agregado correctamente");
      })
      .catch((error) => {
        console.error(error);
        Alert.alert("Error", "No se pudo agregar el curso");
      })
      .finally(() => {
        setAdding(false);
      });
  };

  const handleUpdateCourse = (id: number) => {
    if (
      !updatedName &&
      !updatedDescription &&
      !updatedStartDate &&
      !updatedEndDate
    ) {
      Alert.alert(
        "Error",
        "Por favor, ingresa al menos un campo para actualizar"
      );
      return;
    }

    setUpdating(true);

    axios
      .put(`https://robotics-api.onrender.com/courses/${id}`, {
        name: updatedName || selectedCourse?.name,
        description: updatedDescription || selectedCourse?.description,
        start_date: updatedStartDate || selectedCourse?.start_date,
        end_date: updatedEndDate || selectedCourse?.end_date
      })
      .then((response) => {
        const updatedCourses = courses.map((course) =>
          course.id === id ? response.data : course
        );
        setCourses(updatedCourses);
        setSelectedCourse(response.data);
        setUpdatedName("");
        setUpdatedDescription("");
        setUpdatedStartDate("");
        setUpdatedEndDate("");
        Alert.alert("Éxito", "Curso actualizado correctamente");
      })
      .catch((error) => {
        console.error(error);
        Alert.alert("Error", "No se pudo actualizar el curso");
      })
      .finally(() => {
        setUpdating(false);
      });
  };

  const handleDeleteCourse = (id: number) => {
    Alert.alert(
      "Confirmación",
      "¿Estás seguro de que deseas eliminar este curso?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => confirmDeleteCourse(id)
        }
      ]
    );
  };

  const confirmDeleteCourse = (id: number) => {
    axios
      .delete(`https://robotics-api.onrender.com/courses/${id}`)
      .then(() => {
        const filteredCourses = courses.filter((course) => course.id !== id);
        setCourses(filteredCourses);
        setSelectedCourse(null);
        Alert.alert("Éxito", "Curso eliminado correctamente");
      })
      .catch((error) => {
        console.error(error);
        Alert.alert("Error", "No se pudo eliminar el curso");
      });
  };

  // Funciones para manejar las sesiones de clase
  const handleAddSession = () => {
    // Validación de campos
    for (let key in newSessionData) {
      if (!newSessionData[key as keyof typeof newSessionData]) {
        Alert.alert("Error", "Por favor, completa todos los campos");
        return;
      }
    }

    // Agregar el course_id del curso seleccionado
    const sessionData = {
      ...newSessionData,
      course_id: selectedCourse?.id,
      student_count: Number(newSessionData.student_count)
    };

    setAdding(true);

    axios
      .post("https://robotics-api.onrender.com/class_sessions", sessionData)
      .then((response) => {
        setClassSessions([...classSessions, response.data]);
        setNewSessionData({
          session_date: "",
          start_time: "",
          end_time: "",
          student_count: "",
          materials_used: ""
        });
        Alert.alert("Éxito", "Sesión de clase agregada correctamente");
      })
      .catch((error) => {
        console.error(error);
        Alert.alert("Error", "No se pudo agregar la sesión de clase");
      })
      .finally(() => {
        setAdding(false);
      });
  };

  const handleUpdateSession = (id: number) => {
    if (Object.values(newSessionData).every((value) => !value)) {
      Alert.alert(
        "Error",
        "Por favor, ingresa al menos un campo para actualizar"
      );
      return;
    }

    setUpdatingSession(true);

    const updatedData = {
      ...selectedSession,
      ...newSessionData,
      student_count: newSessionData.student_count
        ? Number(newSessionData.student_count)
        : selectedSession?.student_count
    };

    axios
      .put(
        `https://robotics-api.onrender.com/class_sessions/${id}`,
        updatedData
      )
      .then((response) => {
        const updatedSessions = classSessions.map((session) =>
          session.id === id ? response.data : session
        );
        setClassSessions(updatedSessions);
        setSelectedSession(null);
        setNewSessionData({
          session_date: "",
          start_time: "",
          end_time: "",
          student_count: "",
          materials_used: ""
        });
        Alert.alert("Éxito", "Sesión de clase actualizada correctamente");
      })
      .catch((error) => {
        console.error(error);
        Alert.alert("Error", "No se pudo actualizar la sesión de clase");
      })
      .finally(() => {
        setUpdatingSession(false);
      });
  };

  const handleDeleteSession = (id: number) => {
    Alert.alert(
      "Confirmación",
      "¿Estás seguro de que deseas eliminar esta sesión de clase?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => confirmDeleteSession(id)
        }
      ]
    );
  };

  const confirmDeleteSession = (id: number) => {
    axios
      .delete(`https://robotics-api.onrender.com/class_sessions/${id}`)
      .then(() => {
        const filteredSessions = classSessions.filter(
          (session) => session.id !== id
        );
        setClassSessions(filteredSessions);
        setSelectedSession(null);
        Alert.alert("Éxito", "Sesión de clase eliminada correctamente");
      })
      .catch((error) => {
        console.error(error);
        Alert.alert("Error", "No se pudo eliminar la sesión de clase");
      });
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (selectedCourse) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>

        <FlatList
          data={[selectedCourse]}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View>
              <View style={styles.detailsContainer}>
                <Image
                  source={{
                    uri: `https://source.unsplash.com/collection/190727/${item.id}`
                  }}
                  style={styles.courseImage}
                />
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.detail}>{item.description}</Text>
                <Text style={styles.detail}>
                  Fecha de inicio: {item.start_date}
                </Text>
                <Text style={styles.detail}>
                  Fecha de finalización: {item.end_date}
                </Text>

                <Text style={styles.subHeader}>
                  Actualizar Información del Curso
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Nombre actualizado"
                  value={updatedName}
                  onChangeText={setUpdatedName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Descripción actualizada"
                  value={updatedDescription}
                  onChangeText={setUpdatedDescription}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Fecha de inicio actualizada"
                  value={updatedStartDate}
                  onChangeText={setUpdatedStartDate}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Fecha de finalización actualizada"
                  value={updatedEndDate}
                  onChangeText={setUpdatedEndDate}
                />
                <Button
                  title={updating ? "Actualizando..." : "Actualizar Curso"}
                  onPress={() => handleUpdateCourse(item.id)}
                  disabled={updating}
                />
                <View style={{ marginVertical: 10 }} />
                <Button
                  title="Eliminar Curso"
                  color="red"
                  onPress={() => handleDeleteCourse(item.id)}
                />
              </View>

              {/* Sesiones de clase */}
              <Text style={styles.subHeader}>Sesiones de Clase</Text>
              {classSessions.length === 0 ? (
                <Text style={styles.noSessionsText}>
                  No hay sesiones de clase para este curso.
                </Text>
              ) : (
                <FlatList
                  data={classSessions}
                  keyExtractor={(session) => session.id.toString()}
                  renderItem={({ item: session }) => (
                    <TouchableOpacity
                      style={styles.sessionItemContainer}
                      onPress={() => setSelectedSession(session)}
                    >
                      <Text style={styles.itemText}>
                        Fecha: {session.session_date}
                      </Text>
                      <Text style={styles.itemSubText}>
                        Hora: {session.start_time} - {session.end_time}
                      </Text>
                    </TouchableOpacity>
                  )}
                  // Agrega este prop para evitar conflictos de scroll
                  nestedScrollEnabled={true}
                />
              )}

              {/* Formulario para agregar una nueva sesión */}
              <View style={styles.formContainer}>
                <Text style={styles.subHeader}>Agregar Nueva Sesión</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Fecha (YYYY-MM-DD)"
                  value={newSessionData.session_date}
                  onChangeText={(value) =>
                    setNewSessionData({
                      ...newSessionData,
                      session_date: value
                    })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Hora de inicio (HH:MM)"
                  value={newSessionData.start_time}
                  onChangeText={(value) =>
                    setNewSessionData({ ...newSessionData, start_time: value })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Hora de fin (HH:MM)"
                  value={newSessionData.end_time}
                  onChangeText={(value) =>
                    setNewSessionData({ ...newSessionData, end_time: value })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Cantidad de estudiantes"
                  value={newSessionData.student_count}
                  onChangeText={(value) =>
                    setNewSessionData({
                      ...newSessionData,
                      student_count: value
                    })
                  }
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Materiales usados"
                  value={newSessionData.materials_used}
                  onChangeText={(value) =>
                    setNewSessionData({
                      ...newSessionData,
                      materials_used: value
                    })
                  }
                />
                <Button
                  title={adding ? "Agregando..." : "Agregar Sesión"}
                  onPress={handleAddSession}
                  disabled={adding}
                />
              </View>

              {/* Detalles y actualización de la sesión seleccionada */}
              {selectedSession && (
                <View style={styles.detailsContainer}>
                  <Text style={styles.subHeader}>Detalle de la Sesión</Text>
                  <Text style={styles.detail}>
                    Fecha: {selectedSession.session_date}
                  </Text>
                  <Text style={styles.detail}>
                    Hora: {selectedSession.start_time} -{" "}
                    {selectedSession.end_time}
                  </Text>
                  <Text style={styles.detail}>
                    Estudiantes: {selectedSession.student_count}
                  </Text>
                  <Text style={styles.detail}>
                    Materiales usados: {selectedSession.materials_used}
                  </Text>

                  <Text style={styles.subHeader}>Actualizar Sesión</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Fecha (YYYY-MM-DD)"
                    value={newSessionData.session_date}
                    onChangeText={(value) =>
                      setNewSessionData({
                        ...newSessionData,
                        session_date: value
                      })
                    }
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Hora de inicio (HH:MM)"
                    value={newSessionData.start_time}
                    onChangeText={(value) =>
                      setNewSessionData({
                        ...newSessionData,
                        start_time: value
                      })
                    }
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Hora de fin (HH:MM)"
                    value={newSessionData.end_time}
                    onChangeText={(value) =>
                      setNewSessionData({ ...newSessionData, end_time: value })
                    }
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Cantidad de estudiantes"
                    value={newSessionData.student_count}
                    onChangeText={(value) =>
                      setNewSessionData({
                        ...newSessionData,
                        student_count: value
                      })
                    }
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Materiales usados"
                    value={newSessionData.materials_used}
                    onChangeText={(value) =>
                      setNewSessionData({
                        ...newSessionData,
                        materials_used: value
                      })
                    }
                  />
                  <Button
                    title={
                      updatingSession ? "Actualizando..." : "Actualizar Sesión"
                    }
                    onPress={() => handleUpdateSession(selectedSession.id)}
                    disabled={updatingSession}
                  />
                  <View style={{ marginVertical: 10 }} />
                  <Button
                    title="Eliminar Sesión"
                    color="red"
                    onPress={() => handleDeleteSession(selectedSession.id)}
                  />
                  <Button
                    title="Cerrar Detalle"
                    onPress={() => {
                      setSelectedSession(null);
                      setNewSessionData({
                        session_date: "",
                        start_time: "",
                        end_time: "",
                        student_count: "",
                        materials_used: ""
                      });
                    }}
                  />
                </View>
              )}
            </View>
          )}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cursos</Text>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => handleCoursePress(item)}
          >
            <Image
              source={{
                uri: `https://source.unsplash.com/collection/190727/${item.id}`
              }}
              style={styles.courseThumbnail}
            />
            <View style={styles.textContainer}>
              <Text style={styles.itemText}>{item.name}</Text>
              <Text style={styles.itemSubText}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <View style={styles.formContainer}>
        <Text style={styles.subHeader}>Agregar Nuevo Curso</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre del curso"
          value={newCourseName}
          onChangeText={setNewCourseName}
        />
        <TextInput
          style={styles.input}
          placeholder="Descripción"
          value={newCourseDescription}
          onChangeText={setNewCourseDescription}
        />
        <TextInput
          style={styles.input}
          placeholder="Fecha de inicio (YYYY-MM-DD)"
          value={newCourseStartDate}
          onChangeText={setNewCourseStartDate}
        />
        <TextInput
          style={styles.input}
          placeholder="Fecha de finalización (YYYY-MM-DD)"
          value={newCourseEndDate}
          onChangeText={setNewCourseEndDate}
        />
        <Button
          title={adding ? "Agregando..." : "Agregar curso"}
          onPress={handleAddCourse}
          disabled={adding}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Mantén tus estilos existentes y agrega nuevos si es necesario
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
  courseThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8
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
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5
  },
  courseImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
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
  subHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#6200ee",
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
  },
  sessionsContainer: {
    marginTop: 20
  },
  noSessionsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginVertical: 10
  },
  sessionItemContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd"
  }
});
