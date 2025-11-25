import KeyboardAvoidingAnimatedView from '@/components/KeyboardAvoidingAnimatedView';
import { StatusBar } from 'expo-status-bar';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import {
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const focusedPadding = 20;
  const paddingBottom = useSharedValue(insets.bottom + focusedPadding);

  const animateTo = (value: number) => {
    paddingBottom.value = withTiming(value, { duration: 200 });
  };

  const handleInputFocus = () => {
    if (Platform.OS === 'web') {
      return;
    }
    animateTo(focusedPadding);
  };

  const handleInputBlur = () => {
    if (Platform.OS === 'web') {
      return;
    }
    animateTo(insets.bottom + focusedPadding);
  };

  const animatedContainerStyle = useAnimatedStyle(() => ({
    paddingBottom: paddingBottom.value,
  }));

  const handleLogin = async () => {
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);

    // Aqui você pode adicionar a lógica de autenticação
    setTimeout(() => {
      setLoading(false);
      console.log('Login:', { email, password });
    }, 1500);
  };

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior='padding'>
      <StatusBar style='light' />

      <View
        style={{
          flex: 1,
          backgroundColor: '#0F172A',
        }}
      >
        {/* Header com gradiente visual */}
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
            Bem-vindo ao Sistema de Ensino
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: '#94A3B8',
            }}
          >
            Entre na sua conta para continuar
          </Text>
        </View>

        {/* Form Container */}
        <Animated.View
          style={[
            {
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              paddingHorizontal: 24,
              paddingTop: 32,
            },
            animatedContainerStyle,
          ]}
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

          {/* Email Input */}
          <View style={{ marginBottom: 20 }}>
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
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </View>
          </View>

          {/* Password Input */}
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
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
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

          {/* Forgot Password */}
          <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 24 }}>
            <Text style={{ color: '#3B82F6', fontSize: 14, fontWeight: '600' }}>
              Esqueceu a senha?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
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
              style={{
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: 'bold',
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#64748B', fontSize: 14 }}>
              Não tem uma conta?{' '}
            </Text>
            <TouchableOpacity>
              <Text
                style={{ color: '#3B82F6', fontSize: 14, fontWeight: '600' }}
              >
                Criar conta
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
