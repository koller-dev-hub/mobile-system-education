import KeyboardAvoidingAnimatedView from '@/components/KeyboardAvoidingAnimatedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Eye, EyeOff, Hash, Lock, Mail, User } from 'lucide-react-native';
import { useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, getBaseURL } from '../../lib/api'

export default function AddUserScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidEmail = (e: string) => /.+@.+\..+/.test(e);

  const handleSignup = async () => {
    setError('');
    if (!name || !surname || !nickname || !age || !email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Email inválido');
      return;
    }
    if (password.length < 8) {
      setError('Senha deve ter pelo menos 8 caracteres');
      return;
    }
    const ageNum = Number(age);
    if (!Number.isFinite(ageNum) || ageNum <= 0) {
      setError('Idade inválida');
      return;
    }

    setLoading(true);
    try {
      await api.post(
        '/users',
        { name, surname, nickname, age: ageNum, email, password },
        { auth: false, timeoutMs: 8000 }
      );

      const baseURL = getBaseURL();
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });
      clearTimeout(t);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = (data && (data.message || data.error)) || 'Falha no login';
        setError(typeof msg === 'string' ? msg : 'Falha no login');
        setLoading(false);
        return;
      }
      const data = await res.json().catch(() => ({}));
      const token =
        data.token || data.accessToken || data.access_token || data.jwt || '';
      try {
        if (token) await AsyncStorage.setItem('auth:token', String(token));
        await AsyncStorage.setItem('auth:logged_in', 'true');
      } catch {}
      router.replace('/schools');
    } catch {
      setError('Não foi possível conectar ao servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior='padding'>
      <StatusBar style='light' />
      <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
        <View
          style={{
            paddingTop: insets.top + 60,
            paddingHorizontal: 24,
            paddingBottom: 40,
          }}
        >
          <Text
            style={{
              fontSize: 36,
              fontWeight: 'bold',
              color: '#FFFFFF',
              marginBottom: 8,
            }}
          >
            Crie sua conta
          </Text>
          <Text style={{ fontSize: 16, color: '#94A3B8' }}>
            Preencha seus dados para começar
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (navigation.canGoBack()) {
                router.back();
              } else {
                router.replace('/login');
              }
            }}
            style={{ marginTop: 12 }}
          >
            <Text style={{ color: '#3B82F6', fontSize: 14, fontWeight: '600' }}>
              Voltar para login
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          keyboardShouldPersistTaps='handled'
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
          style={{
            flex: 1,
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            paddingHorizontal: 24,
            paddingTop: 32,
          }}
        >
          {error ? (
            <View
              style={{
                backgroundColor: '#FEE2E2',
                padding: 12,
                borderRadius: 8,
                marginBottom: 20,
              }}
            >
              <Text style={{ color: '#DC2626', fontSize: 14 }}>{error}</Text>
            </View>
          ) : null}

          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#1E293B',
                marginBottom: 8,
              }}
            >
              Nome
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F8FAFC',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E2E8F0',
                paddingHorizontal: 16,
              }}
            >
              <User size={20} color='#64748B' />
              <TextInput
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  paddingHorizontal: 12,
                  fontSize: 16,
                  color: '#1E293B',
                }}
                placeholder='Seu nome'
                placeholderTextColor='#94A3B8'
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#1E293B',
                marginBottom: 8,
              }}
            >
              Sobrenome
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F8FAFC',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E2E8F0',
                paddingHorizontal: 16,
              }}
            >
              <User size={20} color='#64748B' />
              <TextInput
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  paddingHorizontal: 12,
                  fontSize: 16,
                  color: '#1E293B',
                }}
                placeholder='Seu sobrenome'
                placeholderTextColor='#94A3B8'
                value={surname}
                onChangeText={setSurname}
              />
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#1E293B',
                marginBottom: 8,
              }}
            >
              Apelido
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F8FAFC',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E2E8F0',
                paddingHorizontal: 16,
              }}
            >
              <Hash size={20} color='#64748B' />
              <TextInput
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  paddingHorizontal: 12,
                  fontSize: 16,
                  color: '#1E293B',
                }}
                placeholder='seu.apelido'
                placeholderTextColor='#94A3B8'
                value={nickname}
                onChangeText={setNickname}
                autoCapitalize='none'
              />
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#1E293B',
                marginBottom: 8,
              }}
            >
              Idade
            </Text>
            <View
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E2E8F0',
                paddingHorizontal: 16,
              }}
            >
              <TextInput
                style={{ paddingVertical: 16, fontSize: 16, color: '#1E293B' }}
                placeholder='Sua idade'
                placeholderTextColor='#94A3B8'
                value={age}
                onChangeText={setAge}
                keyboardType='number-pad'
              />
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#1E293B',
                marginBottom: 8,
              }}
            >
              Email
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F8FAFC',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E2E8F0',
                paddingHorizontal: 16,
              }}
            >
              <Mail size={20} color='#64748B' />
              <TextInput
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  paddingHorizontal: 12,
                  fontSize: 16,
                  color: '#1E293B',
                }}
                placeholder='seu@email.com'
                placeholderTextColor='#94A3B8'
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
                autoCapitalize='none'
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#1E293B',
                marginBottom: 8,
              }}
            >
              Senha
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F8FAFC',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E2E8F0',
                paddingHorizontal: 16,
              }}
            >
              <Lock size={20} color='#64748B' />
              <TextInput
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  paddingHorizontal: 12,
                  fontSize: 16,
                  color: '#1E293B',
                }}
                placeholder='••••••••'
                placeholderTextColor='#94A3B8'
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize='none'
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ padding: 4 }}
              >
                {showPassword ? (
                  <EyeOff size={20} color='#64748B' />
                ) : (
                  <Eye size={20} color='#64748B' />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#94A3B8' : '#3B82F6',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: 24,
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text
              style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}
            >
              {loading ? 'Criando...' : 'Criar conta'}
            </Text>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#64748B', fontSize: 14 }}>
              Já tem uma conta?{' '}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (navigation.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/login');
                }
              }}
            >
              <Text
                style={{ color: '#3B82F6', fontSize: 14, fontWeight: '600' }}
              >
                Entrar
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
