import KeyboardAvoidingAnimatedView from '@/components/KeyboardAvoidingAnimatedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ArrowLeft,
  Building2,
  Hash,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
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

interface SchoolForm {
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
  email: string;
  isActive: boolean;
  description: string;
}

type FormErrors = Partial<Record<keyof SchoolForm, string>>;

export default function RegisterSchoolScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [stateQuery, setStateQuery] = useState('');
  const [debouncedStateQuery, setDebouncedStateQuery] = useState('');

  const [formData, setFormData] = useState<SchoolForm>({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Brasil',
    phoneNumber: '',
    email: '',
    isActive: true,
    description: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const STATES = [
    'Acre',
    'Alagoas',
    'Amapá',
    'Amazonas',
    'Bahia',
    'Ceará',
    'Distrito Federal',
    'Espírito Santo',
    'Goiás',
    'Maranhão',
    'Mato Grosso',
    'Mato Grosso do Sul',
    'Minas Gerais',
    'Pará',
    'Paraíba',
    'Paraná',
    'Pernambuco',
    'Piauí',
    'Rio de Janeiro',
    'Rio Grande do Norte',
    'Rio Grande do Sul',
    'Rondônia',
    'Roraima',
    'Santa Catarina',
    'São Paulo',
    'Sergipe',
    'Tocantins',
  ];
  const COUNTRIES = ['Brasil'];

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
    const t = setTimeout(() => setDebouncedStateQuery(stateQuery), 200);
    return () => clearTimeout(t);
  }, [stateQuery]);

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

  const updateForm = <K extends keyof SchoolForm>(
    field: K,
    value: SchoolForm[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const strip = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const filteredStates = STATES.filter((st) =>
    strip(st).toLowerCase().includes(strip(debouncedStateQuery).toLowerCase())
  );
  const sortedFilteredStates = [...filteredStates].sort((a, b) =>
    a.localeCompare(b, 'pt', { sensitivity: 'base' })
  );

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

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.code.trim()) newErrors.code = 'Código é obrigatório';
    if (!formData.address.trim()) newErrors.address = 'Endereço é obrigatório';
    if (!formData.city.trim()) newErrors.city = 'Cidade é obrigatória';
    if (!formData.state.trim()) newErrors.state = 'Estado é obrigatório';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'CEP é obrigatório';
    if (!formData.country.trim()) newErrors.country = 'País é obrigatório';
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = 'Telefone é obrigatório';

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    const zipDigits = onlyDigits(formData.zipCode);
    if (zipDigits.length !== 8) {
      newErrors.zipCode = 'CEP inválido';
    }

    const phoneDigits = onlyDigits(formData.phoneNumber);
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      newErrors.phoneNumber = 'Telefone inválido';
    }

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
        name: formData.name,
        code: formData.code,
        address: formData.address,
        city: formData.city,
        State: formData.state,
        zip_code: onlyDigits(formData.zipCode),
        country: formData.country,
        phone_number: onlyDigits(formData.phoneNumber),
        email: formData.email,
        is_active: formData.isActive,
        description: formData.description,
      };

      await api.post('/schools', payload);
      Alert.alert('Sucesso!', 'Escola cadastrada com sucesso', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Erro', err?.message || 'Falha ao cadastrar escola');
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
            <Text style={styles.headerTitle}>Cadastrar Escola</Text>
            <Text style={styles.headerSubtitle}>
              Preencha as informações da escola
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
          >
            <Text style={styles.sectionTitle}>Informações Básicas</Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>
                Nome da Escola <Text style={styles.requiredMark}>*</Text>
              </Text>

              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.name ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <Building2 size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='Nome completo da escola'
                  placeholderTextColor='#94A3B8'
                  value={formData.name}
                  onChangeText={(text) => updateForm('name', text)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>

              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>
                Código <Text style={styles.requiredMark}>*</Text>
              </Text>

              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.code ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <Hash size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='Código único da escola'
                  placeholderTextColor='#94A3B8'
                  value={formData.code}
                  onChangeText={(text) => updateForm('code', text)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>

              {errors.code && (
                <Text style={styles.errorText}>{errors.code}</Text>
              )}
            </View>

            <View style={[styles.switchRow, { marginBottom: 30 }]}>
              <Text
                style={{ fontSize: 16, fontWeight: '600', color: '#1E293B' }}
              >
                Escola Ativa <Text style={{ color: '#DC2626' }}>*</Text>
              </Text>

              <Switch
                value={formData.isActive}
                onValueChange={(value) => updateForm('isActive', value)}
              />
            </View>

            <Text style={styles.sectionTitle}>Endereço</Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={styles.label}>
                Endereço <Text style={styles.requiredMark}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.address ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <MapPin size={20} color='#64748B' />
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

            <View style={{ marginBottom: 16 }}>
              <Text style={styles.label}>
                Cidade <Text style={styles.requiredMark}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.city ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <MapPin size={20} color='#64748B' />
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

            <View style={{ marginBottom: 16 }}>
              <Text style={styles.label}>
                Estado <Text style={styles.requiredMark}>*</Text>
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowStateModal(true)}
                style={[
                  styles.inputRow,
                  { borderColor: errors.state ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <MapPin size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='Estado'
                  placeholderTextColor='#94A3B8'
                  editable={false}
                  value={formData.state}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </TouchableOpacity>
              {errors.state && (
                <Text style={styles.errorText}>{errors.state}</Text>
              )}
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={styles.label}>
                CEP <Text style={styles.requiredMark}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.zipCode ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <MapPin size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='CEP'
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

            <View style={{ marginBottom: 24 }}>
              <Text style={styles.label}>
                País <Text style={styles.requiredMark}>*</Text>
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowCountryModal(true)}
                style={[
                  styles.inputRow,
                  { borderColor: errors.country ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <MapPin size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='País'
                  placeholderTextColor='#94A3B8'
                  editable={false}
                  value={formData.country}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </TouchableOpacity>
              {errors.country && (
                <Text style={styles.errorText}>{errors.country}</Text>
              )}
            </View>

            <Text style={styles.sectionTitle}>Contato</Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={styles.label}>
                Telefone <Text style={styles.requiredMark}>*</Text>
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
                  placeholder='Telefone de contato'
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

            <Modal visible={showStateModal} transparent animationType='fade'>
              <View style={styles.modalOverlay}>
                <View style={styles.modalCardTall}>
                  <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
                    <TextInput
                      style={styles.textInput}
                      placeholder='Buscar estado...'
                      placeholderTextColor='#94A3B8'
                      value={stateQuery}
                      onChangeText={setStateQuery}
                    />
                  </View>
                  <ScrollView keyboardShouldPersistTaps='always'>
                    {sortedFilteredStates.map((st) => (
                      <TouchableOpacity
                        key={st}
                        activeOpacity={0.6}
                        onPress={() => {
                          updateForm('state', st);
                          setShowStateModal(false);
                          setStateQuery('');
                        }}
                        style={styles.modalItem}
                      >
                        <Text style={styles.modalItemText}>{st}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TouchableOpacity
                    onPress={() => setShowStateModal(false)}
                    style={styles.modalClose}
                  >
                    <Text style={styles.modalCloseText}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Modal visible={showCountryModal} transparent animationType='fade'>
              <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                  {COUNTRIES.map((c) => (
                    <TouchableOpacity
                      key={c}
                      onPress={() => {
                        updateForm('country', c);
                        setShowCountryModal(false);
                      }}
                      style={styles.modalItem}
                    >
                      <Text style={styles.modalItemText}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    onPress={() => setShowCountryModal(false)}
                    style={styles.modalClose}
                  >
                    <Text style={styles.modalCloseText}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <View style={{ marginBottom: 24 }}>
              <Text style={styles.label}>
                Email <Text style={styles.requiredMark}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.email ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <Mail size={20} color='#64748B' />
                <TextInput
                  style={styles.textInput}
                  placeholder='Email de contato'
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

            <Text style={styles.sectionTitle}>Descrição</Text>

            <View style={{ marginBottom: 24 }}>
              <Text style={styles.label}>
                Descrição <Text style={styles.requiredMark}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputRow,
                  { borderColor: errors.description ? '#DC2626' : '#E2E8F0' },
                ]}
              >
                <Building2 size={20} color='#64748B' />
                <TextInput
                  style={styles.textAreaInput}
                  placeholder='Descrição da escola'
                  placeholderTextColor='#94A3B8'
                  multiline
                  value={formData.description}
                  onChangeText={(text) => updateForm('description', text)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
              {errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}
            </View>

            {(() => {
              const requiredFilled =
                formData.name.trim() &&
                formData.code.trim() &&
                formData.address.trim() &&
                formData.city.trim() &&
                formData.state.trim() &&
                formData.zipCode.trim() &&
                formData.country.trim() &&
                formData.phoneNumber.trim() &&
                formData.email.trim() &&
                formData.description.trim();
              const emailValid = /\S+@\S+\.\S+/.test(formData.email);
              const zipValid = onlyDigits(formData.zipCode).length === 8;
              const phoneValid = (() => {
                const len = onlyDigits(formData.phoneNumber).length;
                return len === 10 || len === 11;
              })();
              const canSubmit = Boolean(
                requiredFilled && emailValid && zipValid && phoneValid
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
                    {loading ? 'Salvando...' : 'Salvar escola'}
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
