import KeyboardAvoidingAnimatedView from '@/components/KeyboardAvoidingAnimatedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Hash, Phone, User } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../../../../lib/api';
import styles from './styles';

interface StudentForm {
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
  shift: 'morning' | 'afternoon' | 'evening';
  enrollmentDate: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianCpf: string;
  isActive: boolean;
  observations: string;
}

type FormErrors = Partial<Record<keyof StudentForm, string>>;

export default function EditStudentScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [initialData, setInitialData] = useState<StudentForm | null>(null);

  const [formData, setFormData] = useState<StudentForm>({
    fullName: '',
    studentId: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    cpf: '',
    rg: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Brasil',
    schoolId: '',
    schoolName: '',
    schoolCode: '',
    grade: '',
    classRoom: '',
    shift: 'morning',
    enrollmentDate: '',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianCpf: '',
    isActive: true,
    observations: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

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
        const data = await api.get(`/students/${id}`);
        const mapped: StudentForm = {
          fullName: data.full_name ?? data.name ?? data.fullName ?? '',
          studentId: String(
            data.enrollment_code ?? data.studentId ?? data.student_id ?? ''
          ),
          email: data.email ?? '',
          phoneNumber: String(data.phone_number ?? data.phoneNumber ?? ''),
          dateOfBirth: String(
            (data.date_of_birth ?? data.dateOfBirth ?? '')
              .toString()
              .split('T')[0]
          ),
          cpf: String(data.cpf ?? ''),
          rg: String(data.rg ?? ''),
          address: data.address ?? '',
          city: data.city ?? '',
          state: data.state ?? '',
          zipCode: String(data.zip_code ?? data.zipCode ?? ''),
          country: data.country ?? 'Brasil',
          schoolId: String(data.school_id ?? data.schoolId ?? ''),
          schoolName: data.school_name ?? data.schoolName ?? '',
          schoolCode: data.school_code ?? data.schoolCode ?? '',
          grade: data.grade ?? '',
          classRoom: data.class_room ?? data.classRoom ?? '',
          shift: (data.shift ?? 'morning') as StudentForm['shift'],
          enrollmentDate: String(
            (data.enrollment_date ?? data.enrollmentDate ?? '')
              .toString()
              .split('T')[0]
          ),
          guardianName: data.guardian_name ?? data.guardianName ?? '',
          guardianPhone: String(
            data.guardian_phone ?? data.guardianPhone ?? ''
          ),
          guardianEmail: data.guardian_email ?? data.guardianEmail ?? '',
          guardianCpf: String(data.guardian_cpf ?? ''),
          isActive: data.is_active ?? data.isActive ?? true,
          observations: data.observations ?? '',
        };
        setFormData(mapped);
        setInitialData(mapped);
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

  const updateForm = <K extends keyof StudentForm>(
    field: K,
    value: StudentForm[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const onlyDigits = (s: string) => s.replace(/\D+/g, '');
  const formatPhone = (s: string) => {
    const d = onlyDigits(s).slice(0, 11);
    if (d.length <= 10) {
      const p1 = d.slice(0, 2);
      const p2 = d.slice(2, 6);
      const p3 = d.slice(6, 10);
      if (d.length <= 2) return `(${p1}`;
      if (d.length <= 6) return `(${p1}) ${p2}`;
      return `(${p1}) ${p2}-${p3}`;
    } else {
      const p1 = d.slice(0, 2);
      const p2 = d.slice(2, 7);
      const p3 = d.slice(7, 11);
      return `(${p1}) ${p2}-${p3}`;
    }
  };
  const toISODate = (s: string) => (s.includes('T') ? s : `${s}T00:00:00Z`);
  const formatCPF = (s: string) => {
    const d = onlyDigits(s).slice(0, 11);
    const p1 = d.slice(0, 3);
    const p2 = d.slice(3, 6);
    const p3 = d.slice(6, 9);
    const p4 = d.slice(9, 11);
    if (d.length <= 3) return p1;
    if (d.length <= 6) return `${p1}.${p2}`;
    if (d.length <= 9) return `${p1}.${p2}.${p3}`;
    return `${p1}.${p2}.${p3}-${p4}`;
  };
  const validateCPF = (cpfMasked: string) => {
    const cpf = onlyDigits(cpfMasked);
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    const calcDigit = (slice: number) => {
      let sum = 0;
      for (let i = 0; i < slice; i++) sum += Number(cpf[i]) * (slice + 1 - i);
      const mod = (sum * 10) % 11;
      return mod === 10 ? 0 : mod;
    };
    const d1 = calcDigit(9);
    const d2 = calcDigit(10);
    return d1 === Number(cpf[9]) && d2 === Number(cpf[10]);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    const zipDigits = onlyDigits(formData.zipCode);
    if (formData.zipCode.trim() && zipDigits.length !== 8) {
      newErrors.zipCode = 'CEP inválido';
    }
    const phoneDigits = onlyDigits(formData.phoneNumber);
    if (
      formData.phoneNumber.trim() &&
      (phoneDigits.length < 10 || phoneDigits.length > 11)
    ) {
      newErrors.phoneNumber = 'Telefone inválido';
    }
    if (formData.cpf.trim() && !validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }
    if (formData.guardianCpf.trim() && !validateCPF(formData.guardianCpf)) {
      newErrors.guardianCpf = 'CPF inválido';
    }
    if (
      formData.guardianEmail.trim() &&
      !/\S+@\S+\.\S+/.test(formData.guardianEmail)
    ) {
      newErrors.guardianEmail = 'Email do responsável inválido';
    }
    const gpDigits = onlyDigits(formData.guardianPhone);
    if (
      formData.guardianPhone.trim() &&
      (gpDigits.length < 10 || gpDigits.length > 11)
    ) {
      newErrors.guardianPhone = 'Telefone inválido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => {
    const payload: any = {};
    if (!initialData) return payload;
    const mapKey = (k: keyof StudentForm) => {
      switch (k) {
        case 'fullName':
          return 'full_name';
        case 'studentId':
          return 'enrollment_code';
        case 'email':
          return 'email';
        case 'phoneNumber':
          return 'phone_number';
        case 'dateOfBirth':
          return 'date_of_birth';
        case 'cpf':
          return 'cpf';
        case 'rg':
          return 'rg';
        case 'address':
          return 'address';
        case 'city':
          return 'city';
        case 'state':
          return 'state';
        case 'zipCode':
          return 'zip_code';
        case 'country':
          return 'country';
        case 'schoolId':
          return 'school_id';
        case 'schoolName':
          return 'school_name';
        case 'schoolCode':
          return 'school_code';
        case 'grade':
          return 'grade';
        case 'classRoom':
          return 'class_room';
        case 'shift':
          return 'shift';
        case 'enrollmentDate':
          return 'enrollment_date';
        case 'guardianName':
          return 'guardian_name';
        case 'guardianPhone':
          return 'guardian_phone';
        case 'guardianEmail':
          return 'guardian_email';
        case 'guardianCpf':
          return 'guardian_cpf';
        case 'isActive':
          return 'is_active';
        case 'observations':
          return 'observations';
        default:
          return k;
      }
    };
    (Object.keys(formData) as (keyof StudentForm)[]).forEach((k) => {
      const current = formData[k];
      const initial = initialData[k];
      const key = mapKey(k);
      if (k === 'zipCode') {
        const val = onlyDigits(String(current));
        if (val !== onlyDigits(String(initial))) payload[key] = val;
        return;
      }
      if (k === 'phoneNumber') {
        const val = onlyDigits(String(current));
        if (val !== onlyDigits(String(initial))) payload[key] = val;
        return;
      }
      if (k === 'guardianPhone') {
        const val = onlyDigits(String(current));
        if (val !== onlyDigits(String(initial))) payload[key] = val;
        return;
      }
      if (k === 'cpf' || k === 'guardianCpf') {
        const val = onlyDigits(String(current));
        if (val !== onlyDigits(String(initial))) payload[key] = val;
        return;
      }
      if (k === 'dateOfBirth' || k === 'enrollmentDate') {
        const val = toISODate(String(current));
        const init = toISODate(String(initial));
        if (val !== init) payload[key] = val;
        return;
      }
      if (current !== initial) payload[key] = current as any;
    });
    return payload;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Erro', 'Por favor, corrija os campos inválidos');
      return;
    }
    const payload = buildPayload();
    if (Object.keys(payload).length === 0) {
      Alert.alert('Nada para salvar', 'Nenhuma alteração detectada');
      return;
    }
    setLoading(true);
    try {
      await api.put(`/students/${id}`, payload);
      Alert.alert('Sucesso!', 'Aluno atualizado com sucesso', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Erro', err?.message || 'Falha ao atualizar aluno');
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.headerTitle}>Editar Aluno</Text>
            <Text style={styles.headerSubtitle}>
              Atualize as informações do aluno
            </Text>
          </View>
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
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.fullName ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <User size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='Nome completo do aluno'
                  placeholderTextColor='#94A3B8'
                  value={formData.fullName}
                  onChangeText={(text) => updateForm('fullName', text)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Telefone do Aluno</Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.phoneNumber ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <Phone size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='Telefone do aluno'
                  placeholderTextColor='#94A3B8'
                  keyboardType='phone-pad'
                  value={formData.phoneNumber}
                  onChangeText={(text) =>
                    updateForm('phoneNumber', formatPhone(text))
                  }
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Email do Aluno</Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.email ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <User size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='Email do aluno'
                  placeholderTextColor='#94A3B8'
                  keyboardType='email-address'
                  autoCapitalize='none'
                  value={formData.email}
                  onChangeText={(text) => updateForm('email', text)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Data de Nascimento</Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.dateOfBirth ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <Hash size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='AAAA-MM-DD'
                  placeholderTextColor='#94A3B8'
                  keyboardType='numeric'
                  value={formData.dateOfBirth}
                  onChangeText={(text) => updateForm('dateOfBirth', text)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>CPF do Aluno</Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.cpf ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <Hash size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='CPF do aluno'
                  placeholderTextColor='#94A3B8'
                  keyboardType='numeric'
                  value={formData.cpf}
                  onChangeText={(text) => updateForm('cpf', formatCPF(text))}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>CPF do Responsável</Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.guardianCpf ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <Hash size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='CPF do responsável'
                  placeholderTextColor='#94A3B8'
                  keyboardType='numeric'
                  value={formData.guardianCpf}
                  onChangeText={(text) =>
                    updateForm('guardianCpf', formatCPF(text))
                  }
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Dados do Aluno</Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Matrícula</Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.studentId ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <Hash size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='Número de matrícula do aluno'
                  placeholderTextColor='#94A3B8'
                  value={formData.studentId}
                  onChangeText={(text) => updateForm('studentId', text)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>RG</Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.rg ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <Hash size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='RG do aluno'
                  placeholderTextColor='#94A3B8'
                  value={formData.rg}
                  onChangeText={(text) => updateForm('rg', text)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Endereço</Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Endereço</Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.address ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <User size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='Rua, número, complemento'
                  placeholderTextColor='#94A3B8'
                  value={formData.address}
                  onChangeText={(text) => updateForm('address', text)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Cidade</Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.city ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <User size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='Cidade'
                  placeholderTextColor='#94A3B8'
                  value={formData.city}
                  onChangeText={(text) => updateForm('city', text)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Estado</Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.state ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <User size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='Estado (UF)'
                  placeholderTextColor='#94A3B8'
                  value={formData.state}
                  onChangeText={(text) => updateForm('state', text)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>País</Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.country ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <User size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='País'
                  placeholderTextColor='#94A3B8'
                  value={formData.country}
                  onChangeText={(text) => updateForm('country', text)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Dados da Escola</Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Escola (ID)</Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.schoolId ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <Hash size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='ID da escola do aluno'
                  placeholderTextColor='#94A3B8'
                  value={formData.schoolId}
                  onChangeText={(text) => updateForm('schoolId', text)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Nome da Escola</Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.schoolName ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <User size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='Nome da escola do aluno'
                  placeholderTextColor='#94A3B8'
                  value={formData.schoolName}
                  onChangeText={(text) => updateForm('schoolName', text)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Série</Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.grade ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <Hash size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='Série do aluno'
                  placeholderTextColor='#94A3B8'
                  value={formData.grade}
                  onChangeText={(text) => updateForm('grade', text)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Turma</Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.classRoom ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <User size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='Turma do aluno'
                  placeholderTextColor='#94A3B8'
                  value={formData.classRoom}
                  onChangeText={(text) => updateForm('classRoom', text)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Turno</Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.shift ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <Hash size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='morning | afternoon | evening'
                  placeholderTextColor='#94A3B8'
                  value={formData.shift}
                  onChangeText={(text) => updateForm('shift', text as any)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Data de Matrícula</Text>
              <View
                style={[
                  styles.inputRow,
                  {
                    borderColor: errors.enrollmentDate ? '#DC2626' : '#E2E8F0',
                  },
                ]}
              >
                <Hash size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='AAAA-MM-DD'
                  placeholderTextColor='#94A3B8'
                  keyboardType='numeric'
                  value={formData.enrollmentDate}
                  onChangeText={(text) => updateForm('enrollmentDate', text)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Responsável</Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Nome do Responsável</Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.guardianName ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <User size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='Nome completo do responsável'
                  placeholderTextColor='#94A3B8'
                  value={formData.guardianName}
                  onChangeText={(text) => updateForm('guardianName', text)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Telefone do Responsável</Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.guardianPhone ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <Phone size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='Telefone do responsável'
                  placeholderTextColor='#94A3B8'
                  keyboardType='phone-pad'
                  value={formData.guardianPhone}
                  onChangeText={(text) =>
                    updateForm('guardianPhone', formatPhone(text))
                  }
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Email do Responsável</Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.guardianEmail ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <User size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='Email do responsável'
                  placeholderTextColor='#94A3B8'
                  keyboardType='email-address'
                  autoCapitalize='none'
                  value={formData.guardianEmail}
                  onChangeText={(text) => updateForm('guardianEmail', text)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Outros</Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Observações</Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.observations ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <User size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='Observações relevantes sobre o aluno'
                  placeholderTextColor='#94A3B8'
                  multiline
                  numberOfLines={3}
                  value={formData.observations}
                  onChangeText={(text) => updateForm('observations', text)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: '600', color: '#1E293B' }}
              >
                Aluno Ativo
              </Text>
              <Switch
                value={formData.isActive}
                onValueChange={(v) => updateForm('isActive', v)}
              />
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              testID='save-button'
              disabled={loading}
              style={[
                styles.submitButton,
                loading ? styles.btnDisabled : styles.btnPrimary,
              ]}
            >
              <Text style={styles.whiteTextBold16}>
                {loading ? 'Salvando...' : 'Salvar alterações'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
