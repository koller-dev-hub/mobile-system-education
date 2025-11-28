import KeyboardAvoidingAnimatedView from '@/components/KeyboardAvoidingAnimatedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Hash, Phone, User } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

export default function RegisterStudentScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

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
  const formatCEP = (s: string) => {
    const d = onlyDigits(s).slice(0, 8);
    if (d.length <= 5) return d;
    return `${d.slice(0, 5)}-${d.slice(5)}`;
  };
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

    if (!formData.fullName.trim()) newErrors.fullName = 'Nome é obrigatório';
    if (!formData.studentId.trim())
      newErrors.studentId = 'Matrícula é obrigatória';

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.dateOfBirth.trim())
      newErrors.dateOfBirth = 'Data de nascimento é obrigatória';

    if (!formData.schoolName.trim())
      newErrors.schoolName = 'Escola é obrigatória';
    if (!formData.schoolCode.trim())
      newErrors.schoolCode = 'Código da escola é obrigatório';
    if (!formData.schoolId.trim())
      newErrors.schoolId = 'Escola (ID) é obrigatória';

    if (!formData.grade.trim()) newErrors.grade = 'Série é obrigatória';
    if (!formData.classRoom.trim()) newErrors.classRoom = 'Turma é obrigatória';
    if (!formData.shift.trim()) newErrors.shift = 'Turno é obrigatório';
    if (!formData.enrollmentDate.trim())
      newErrors.enrollmentDate = 'Data de matrícula é obrigatória';

    if (!formData.guardianName.trim())
      newErrors.guardianName = 'Nome do responsável é obrigatório';
    if (!formData.guardianPhone.trim())
      newErrors.guardianPhone = 'Telefone do responsável é obrigatório';
    if (!formData.guardianEmail.trim()) {
      newErrors.guardianEmail = 'Email do responsável é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.guardianEmail)) {
      newErrors.guardianEmail = 'Email do responsável inválido';
    }

    const zipDigits = onlyDigits(formData.zipCode);
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'CEP é obrigatório';
    } else if (zipDigits.length !== 8) {
      newErrors.zipCode = 'CEP inválido';
    }

    const phoneDigits = onlyDigits(formData.phoneNumber);
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Telefone é obrigatório';
    } else if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      newErrors.phoneNumber = 'Telefone inválido';
    }

    const guardianPhoneDigits = onlyDigits(formData.guardianPhone);
    if (formData.guardianPhone.trim()) {
      if (guardianPhoneDigits.length < 10 || guardianPhoneDigits.length > 11) {
        newErrors.guardianPhone = 'Telefone inválido';
      }
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }
    if (!formData.guardianCpf.trim()) {
      newErrors.guardianCpf = 'CPF é obrigatório';
    } else if (!validateCPF(formData.guardianCpf)) {
      newErrors.guardianCpf = 'CPF inválido';
    }
    if (!formData.rg.trim()) newErrors.rg = 'RG é obrigatório';
    if (!formData.address.trim()) newErrors.address = 'Endereço é obrigatório';
    if (!formData.city.trim()) newErrors.city = 'Cidade é obrigatória';
    if (!formData.state.trim()) newErrors.state = 'Estado é obrigatório';
    if (!formData.country.trim()) newErrors.country = 'País é obrigatório';
    if (!formData.observations.trim())
      newErrors.observations = 'Observações são obrigatórias';

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Erro', 'Por favor, corrija os campos obrigatórios');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        full_name: formData.fullName,
        student_id: formData.studentId,
        email: formData.email,
        phone_number: onlyDigits(formData.phoneNumber),
        date_of_birth: formData.dateOfBirth,
        cpf: onlyDigits(formData.cpf),
        rg: formData.rg,
        address: formData.address,
        city: formData.city,
        State: formData.state,
        zip_code: onlyDigits(formData.zipCode),
        country: formData.country,
        school_id: formData.schoolId,
        school_name: formData.schoolName,
        school_code: formData.schoolCode,
        grade: formData.grade,
        class_room: formData.classRoom,
        shift: formData.shift,
        enrollment_date: formData.enrollmentDate,
        guardian_name: formData.guardianName,
        guardian_phone: onlyDigits(formData.guardianPhone),
        guardian_email: formData.guardianEmail,
        responsible_cpf: onlyDigits(formData.guardianCpf),
        is_active: formData.isActive,
        observations: formData.observations,
      };

      await api.post('/students', payload);
      Alert.alert('Sucesso!', 'Aluno cadastrado com sucesso', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Erro', err?.message || 'Falha ao cadastrar aluno');
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
            <Text style={styles.headerTitle}>Cadastrar Aluno</Text>
            <Text style={styles.headerSubtitle}>
              Preencha as informações do aluno
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
              if (diff > 8 && !hiddenRef.current) {
                hiddenRef.current = true;
              } else if (diff < -8 && hiddenRef.current) {
                hiddenRef.current = false;
              }
              lastOffset.current = y;
            }}
            scrollEventThrottle={16}
          >
            <Text style={styles.sectionTitle}>Informações Pessoais</Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>
                Nome Completo <Text style={styles.requiredMark}>*</Text>
              </Text>
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
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              )}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>
                Código da Escola <Text style={styles.requiredMark}>*</Text>
              </Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0' }]}>
                <Hash size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='Código da escola do aluno'
                  placeholderTextColor='#94A3B8'
                  value={formData.schoolCode}
                  onChangeText={(text) => updateForm('schoolCode', text)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>
                Telefone do Aluno <Text style={styles.requiredMark}>*</Text>
              </Text>
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
              {errors.phoneNumber && (
                <Text style={styles.errorText}>{errors.phoneNumber}</Text>
              )}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>
                CEP <Text style={styles.requiredMark}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.zipCode ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <Hash size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='CEP do aluno'
                  placeholderTextColor='#94A3B8'
                  keyboardType='numeric'
                  value={formData.zipCode}
                  onChangeText={(text) =>
                    updateForm('zipCode', formatCEP(text))
                  }
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
              {errors.zipCode && (
                <Text style={styles.errorText}>{errors.zipCode}</Text>
              )}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>
                CPF do Aluno <Text style={styles.requiredMark}>*</Text>
              </Text>
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
              {errors.cpf && <Text style={styles.errorText}>{errors.cpf}</Text>}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>
                CPF do Responsável <Text style={styles.requiredMark}>*</Text>
              </Text>
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
              {errors.guardianCpf && (
                <Text style={styles.errorText}>{errors.guardianCpf}</Text>
              )}
            </View>

            <Text style={styles.sectionTitle}>Dados do Aluno</Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>
                Matrícula <Text style={styles.requiredMark}>*</Text>
              </Text>
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
              {errors.studentId && (
                <Text style={styles.errorText}>{errors.studentId}</Text>
              )}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>
                Email do Aluno <Text style={styles.requiredMark}>*</Text>
              </Text>
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
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>
                Data de Nascimento <Text style={styles.requiredMark}>*</Text>
              </Text>
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
              {errors.dateOfBirth && (
                <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
              )}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>
                RG <Text style={styles.requiredMark}>*</Text>
              </Text>
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
              {errors.rg && <Text style={styles.errorText}>{errors.rg}</Text>}
            </View>

            <Text style={styles.sectionTitle}>Endereço</Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>
                Endereço <Text style={styles.requiredMark}>*</Text>
              </Text>
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
              {errors.address && (
                <Text style={styles.errorText}>{errors.address}</Text>
              )}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>
                Cidade <Text style={styles.requiredMark}>*</Text>
              </Text>
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
              {errors.city && (
                <Text style={styles.errorText}>{errors.city}</Text>
              )}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>
                Estado <Text style={styles.requiredMark}>*</Text>
              </Text>
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
              {errors.state && (
                <Text style={styles.errorText}>{errors.state}</Text>
              )}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>
                País <Text style={styles.requiredMark}>*</Text>
              </Text>
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
              {errors.country && (
                <Text style={styles.errorText}>{errors.country}</Text>
              )}
            </View>

            <Text style={styles.sectionTitle}>Dados da Escola</Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>
                Escola (ID) <Text style={styles.requiredMark}>*</Text>
              </Text>
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
              {errors.schoolId && (
                <Text style={styles.errorText}>{errors.schoolId}</Text>
              )}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>
                Nome da Escola <Text style={styles.requiredMark}>*</Text>
              </Text>
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
              {errors.schoolName && (
                <Text style={styles.errorText}>{errors.schoolName}</Text>
              )}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>
                Série <Text style={styles.requiredMark}>*</Text>
              </Text>
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
              {errors.grade && (
                <Text style={styles.errorText}>{errors.grade}</Text>
              )}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>
                Turma <Text style={styles.requiredMark}>*</Text>
              </Text>
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
              {errors.classRoom && (
                <Text style={styles.errorText}>{errors.classRoom}</Text>
              )}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>
                Turno <Text style={styles.requiredMark}>*</Text>
              </Text>
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
              {errors.shift && (
                <Text style={styles.errorText}>{errors.shift}</Text>
              )}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>
                Data de Matrícula <Text style={styles.requiredMark}>*</Text>
              </Text>
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
              {errors.enrollmentDate && (
                <Text style={styles.errorText}>{errors.enrollmentDate}</Text>
              )}
            </View>

            <Text style={styles.sectionTitle}>Responsável</Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>
                Nome do Responsável <Text style={styles.requiredMark}>*</Text>
              </Text>
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
              {errors.guardianName && (
                <Text style={styles.errorText}>{errors.guardianName}</Text>
              )}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>
                Telefone do Responsável{' '}
                <Text style={styles.requiredMark}>*</Text>
              </Text>
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
              {errors.guardianPhone && (
                <Text style={styles.errorText}>{errors.guardianPhone}</Text>
              )}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>
                Email do Responsável <Text style={styles.requiredMark}>*</Text>
              </Text>
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
              {errors.guardianEmail && (
                <Text style={styles.errorText}>{errors.guardianEmail}</Text>
              )}
            </View>

            <Text style={styles.sectionTitle}>Outros</Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>
                Observações <Text style={styles.requiredMark}>*</Text>
              </Text>
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
              {errors.observations && (
                <Text style={styles.errorText}>{errors.observations}</Text>
              )}
            </View>

            {(() => {
              const requiredFilled =
                formData.fullName.trim() &&
                formData.studentId.trim() &&
                formData.email.trim() &&
                formData.phoneNumber.trim() &&
                formData.dateOfBirth.trim() &&
                formData.cpf.trim() &&
                formData.rg.trim() &&
                formData.address.trim() &&
                formData.city.trim() &&
                formData.state.trim() &&
                formData.zipCode.trim() &&
                formData.country.trim() &&
                formData.schoolName.trim() &&
                formData.schoolCode.trim() &&
                formData.schoolId.trim() &&
                formData.grade.trim() &&
                formData.classRoom.trim() &&
                formData.shift.trim() &&
                formData.enrollmentDate.trim() &&
                formData.guardianName.trim() &&
                formData.guardianPhone.trim() &&
                formData.guardianEmail.trim() &&
                formData.guardianCpf.trim() &&
                formData.observations.trim();
              const emailValid = /\S+@\S+\.\S+/.test(formData.email);
              const zipValid = onlyDigits(formData.zipCode).length === 8;
              const phoneValid = (() => {
                const len = onlyDigits(formData.phoneNumber).length;
                return len === 10 || len === 11;
              })();
              const guardianPhoneValid = (() => {
                const len = onlyDigits(formData.guardianPhone).length;
                return len === 10 || len === 11;
              })();
              const cpfValid = validateCPF(formData.cpf);
              const guardianCpfValid = validateCPF(formData.guardianCpf);
              const guardianEmailValid = /\S+@\S+\.\S+/.test(
                formData.guardianEmail
              );
              const canSubmit = Boolean(
                requiredFilled &&
                  emailValid &&
                  zipValid &&
                  phoneValid &&
                  guardianPhoneValid &&
                  cpfValid &&
                  guardianCpfValid &&
                  guardianEmailValid
              );
              return (
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading || !canSubmit}
                  style={[
                    styles.submitButton,
                    loading || !canSubmit
                      ? styles.btnDisabled
                      : styles.btnPrimary,
                  ]}
                >
                  <Text style={styles.whiteTextBold16}>
                    {loading ? 'Salvando...' : 'Salvar aluno'}
                  </Text>
                </TouchableOpacity>
              );
            })()}
          </ScrollView>
        </Animated.View>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
