import KeyboardAvoidingAnimatedView from '@/components/KeyboardAvoidingAnimatedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
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

export default function EditSchoolScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [initialData, setInitialData] = useState<SchoolForm | null>(null);

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
    if (checkingAuth) return;
    (async () => {
      try {
        const data = await api.get(`/schools/${id}`);
        const mapped: SchoolForm = {
          name: data.name ?? '',
          code: data.code ?? '',
          address: data.address ?? '',
          city: data.city ?? '',
          state: data.State ?? data.state ?? '',
          zipCode: String(data.zip_code ?? data.zipCode ?? ''),
          country: data.country ?? 'Brasil',
          phoneNumber: String(data.phone_number ?? data.phoneNumber ?? ''),
          email: data.email ?? '',
          isActive: data.is_active ?? data.isActive ?? true,
          description: data.description ?? '',
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

  const updateForm = <K extends keyof SchoolForm>(
    field: K,
    value: SchoolForm[K]
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => {
    const payload: any = {};
    if (!initialData) return payload;
    const mapKey = (k: keyof SchoolForm) => {
      switch (k) {
        case 'name':
          return 'name';
        case 'code':
          return 'code';
        case 'address':
          return 'address';
        case 'city':
          return 'city';
        case 'state':
          return 'State';
        case 'zipCode':
          return 'zip_code';
        case 'country':
          return 'country';
        case 'phoneNumber':
          return 'phone_number';
        case 'email':
          return 'email';
        case 'isActive':
          return 'is_active';
        case 'description':
          return 'description';
        default:
          return k;
      }
    };
    (Object.keys(formData) as (keyof SchoolForm)[]).forEach((k) => {
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
      await api.put(`/schools/${id}`, payload);
      Alert.alert('Sucesso!', 'Escola atualizada com sucesso', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Erro', err?.message || 'Falha ao atualizar escola');
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
            <Text style={styles.headerTitle}>Editar Escola</Text>
            <Text style={styles.headerSubtitle}>
              Atualize as informações da escola
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
            <Text style={styles.sectionTitle}>Informações</Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>Nome da Escola</Text>
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
              <Text style={styles.label}>Código</Text>
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
                Escola Ativa
              </Text>
              <Switch
                value={formData.isActive}
                onValueChange={(value) => updateForm('isActive', value)}
              />
            </View>

            <Text style={styles.sectionTitle}>Endereço</Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={styles.label}>Endereço</Text>
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
              <Text style={styles.label}>Cidade</Text>
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
              <Text style={styles.label}>Estado</Text>
              <View
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

            <View style={{ marginBottom: 16 }}>
              <Text style={styles.label}>CEP</Text>
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
              <Text style={styles.label}>País</Text>
              <View
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

            <Text style={styles.sectionTitle}>Contato</Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={styles.label}>Telefone</Text>
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

            <View style={{ marginBottom: 24 }}>
              <Text style={styles.label}>Email</Text>
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
              <Text style={styles.label}>Descrição</Text>
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

            <TouchableOpacity
              onPress={handleSubmit}
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

      <Modal visible={showStateModal} transparent animationType='fade'>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCardTall}>
            <ScrollView>
              {STATES.map((st) => (
                <TouchableOpacity
                  key={st}
                  onPress={() => {
                    updateForm('state', st);
                    setShowStateModal(false);
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
    </KeyboardAvoidingAnimatedView>
  );
}
