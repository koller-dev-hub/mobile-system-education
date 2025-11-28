import KeyboardAvoidingAnimatedView from '@/components/KeyboardAvoidingAnimatedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Hash, Phone, User } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../../../../lib/api';
import styles from './styles';

interface StudentDetails {
  fullName: string;
  studentId: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  cpf: string;
  rg: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  schoolId: string;
  schoolName: string;
  schoolCode: string;
  grade: string;
  classRoom: string;
  shift: string;
  enrollmentDate: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianCpf: string;
  isActive: boolean;
  observations: string;
}

export default function ViewStudentScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [data, setData] = useState<StudentDetails | null>(null);

  const focusedPadding = 20;
  const paddingAnimation = useRef(
    new Animated.Value(insets.bottom + focusedPadding)
  ).current;
  const lastOffset = useRef(0);
  const hiddenRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const flag = await AsyncStorage.getItem('auth:logged_in');
        if (flag !== 'true') router.replace('/');
      } catch {}
      setCheckingAuth(false);
    })();
  }, []);

  useEffect(() => {
    if (checkingAuth) return;
    (async () => {
      try {
        const res = await api.get(`/students/${id}`);
        const mapped: StudentDetails = {
          fullName: res.full_name ?? res.name ?? '',
          studentId: String(res.enrollment_code ?? res.student_id ?? ''),
          email: res.email ?? '',
          phoneNumber: String(res.phone_number ?? res.phoneNumber ?? ''),
          dateOfBirth: String(
            (res.date_of_birth ?? res.dateOfBirth ?? '')
              .toString()
              .split('T')[0]
          ),
          cpf: String(res.cpf ?? ''),
          rg: String(res.rg ?? ''),
          address: res.address ?? '',
          city: res.city ?? '',
          state: res.state ?? '',
          zipCode: String(res.zip_code ?? res.zipCode ?? ''),
          country: res.country ?? 'Brasil',
          schoolId: String(res.school_id ?? ''),
          schoolName: res.school_name ?? '',
          schoolCode: res.school_code ?? '',
          grade: res.grade ?? '',
          classRoom: res.class_room ?? '',
          shift: String(res.shift ?? ''),
          enrollmentDate: String(
            (res.enrollment_date ?? res.enrollmentDate ?? '')
              .toString()
              .split('T')[0]
          ),
          guardianName: res.guardian_name ?? '',
          guardianPhone: String(res.guardian_phone ?? ''),
          guardianEmail: res.guardian_email ?? '',
          guardianCpf: String(res.guardian_cpf ?? ''),
          isActive: res.is_active ?? true,
          observations: res.observations ?? '',
        };
        setData(mapped);
      } catch {}
    })();
  }, [checkingAuth, id]);

  const animateTo = (value: number) => {
    Animated.timing(paddingAnimation, {
      toValue: value,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  const handleInputFocus = () => {
    if (Platform.OS !== 'web') animateTo(focusedPadding);
  };
  const handleInputBlur = () => {
    if (Platform.OS !== 'web') animateTo(insets.bottom + focusedPadding);
  };

  if (checkingAuth) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size='small' color='#FFFFFF' />
          <Text style={styles.loadingText}>Verificando sessão...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior='padding'>
      <StatusBar style='light' />

      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color='#FFFFFF' />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Aluno</Text>
            <Text style={styles.headerSubtitle}>
              Visualize os dados do aluno
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push(`/students/edit-student/${id}`)}
            style={{ marginLeft: 12 }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
              Editar
            </Text>
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[styles.content, { paddingBottom: paddingAnimation }]}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onScroll={(e) => {
              const y = e.nativeEvent.contentOffset.y;
              const diff = y - lastOffset.current;
              if (diff > 8 && !hiddenRef.current) hiddenRef.current = true;
              else if (diff < -8 && hiddenRef.current)
                hiddenRef.current = false;
              lastOffset.current = y;
            }}
            scrollEventThrottle={16}
          >
            <Text style={styles.sectionTitle}>Informações Pessoais</Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Nome Completo</Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0' }]}>
                <User size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  value={data?.fullName || ''}
                  editable={false}
                  selectTextOnFocus={false}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Telefone do Aluno</Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0' }]}>
                <Phone size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  value={data?.phoneNumber || ''}
                  editable={false}
                  selectTextOnFocus={false}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Email do Aluno</Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0' }]}>
                <User size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  value={data?.email || ''}
                  editable={false}
                  selectTextOnFocus={false}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Data de Nascimento</Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0' }]}>
                <Hash size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  value={data?.dateOfBirth || ''}
                  editable={false}
                  selectTextOnFocus={false}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>CPF do Aluno</Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0' }]}>
                <Hash size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  value={data?.cpf || ''}
                  editable={false}
                  selectTextOnFocus={false}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>CPF do Responsável</Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0' }]}>
                <Hash size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  value={data?.guardianCpf || ''}
                  editable={false}
                  selectTextOnFocus={false}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Dados do Aluno</Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Matrícula</Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0' }]}>
                <Hash size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  value={data?.studentId || ''}
                  editable={false}
                  selectTextOnFocus={false}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>RG</Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0' }]}>
                <Hash size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  value={data?.rg || ''}
                  editable={false}
                  selectTextOnFocus={false}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Endereço</Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Endereço</Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0' }]}>
                <User size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  value={data?.address || ''}
                  editable={false}
                  selectTextOnFocus={false}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Cidade</Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0' }]}>
                <User size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  value={data?.city || ''}
                  editable={false}
                  selectTextOnFocus={false}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Estado</Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0' }]}>
                <User size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  value={data?.state || ''}
                  editable={false}
                  selectTextOnFocus={false}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>País</Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0' }]}>
                <User size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  value={data?.country || ''}
                  editable={false}
                  selectTextOnFocus={false}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Dados da Escola</Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Código da Escola</Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0' }]}>
                <Hash size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  value={data?.schoolCode || ''}
                  editable={false}
                  selectTextOnFocus={false}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Nome da Escola</Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0' }]}>
                <User size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  value={data?.schoolName || ''}
                  editable={false}
                  selectTextOnFocus={false}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Série</Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0' }]}>
                <Hash size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  value={data?.grade || ''}
                  editable={false}
                  selectTextOnFocus={false}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Turma</Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0' }]}>
                <User size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  value={data?.classRoom || ''}
                  editable={false}
                  selectTextOnFocus={false}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Turno</Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0' }]}>
                <Hash size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  value={data?.shift || ''}
                  editable={false}
                  selectTextOnFocus={false}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Data de Matrícula</Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0' }]}>
                <Hash size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  value={data?.enrollmentDate || ''}
                  editable={false}
                  selectTextOnFocus={false}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Responsável</Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Nome do Responsável</Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0' }]}>
                <User size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  value={data?.guardianName || ''}
                  editable={false}
                  selectTextOnFocus={false}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Telefone do Responsável</Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0' }]}>
                <Phone size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  value={data?.guardianPhone || ''}
                  editable={false}
                  selectTextOnFocus={false}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Email do Responsável</Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0' }]}>
                <User size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  value={data?.guardianEmail || ''}
                  editable={false}
                  selectTextOnFocus={false}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Outros</Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Observações</Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0' }]}>
                <User size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  value={data?.observations || ''}
                  editable={false}
                  multiline
                  numberOfLines={3}
                  selectTextOnFocus={false}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
