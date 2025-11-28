import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ArrowLeft,
  GraduationCap,
  Mail,
  Phone,
  Search,
  User,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../../../lib/api';

interface Student {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  status?: string;
}

export default function StudentsScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const lastOffset = useRef(0);
  const hiddenRef = useRef(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);

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
        const data = await api.get('/students');
        const list: Student[] = Array.isArray(data)
          ? data.map((d: any) => ({
              id: String(d.id ?? d._id ?? d.student_id ?? Math.random()),
              name: d.name ?? d.full_name ?? '',
              email: d.email ?? '',
              phoneNumber: d.phone_number ?? d.phoneNumber ?? '',
              status: d.status ?? (d.is_active ? 'ATIVO' : 'INATIVO'),
            }))
          : [];
        setStudents(list);
      } catch {
        setStudents([]);
      } finally {
        setLoadingList(false);
      }
    })();
  }, [checkingAuth]);

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem: ListRenderItem<Student> = ({ item }) => (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F1F5F9',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <User size={18} color='#3B82F6' />
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#1E293B',
              marginLeft: 8,
            }}
          >
            {item.name}
          </Text>
        </View>
        {!!item.status && (
          <View
            style={{
              backgroundColor: '#EFF6FF',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '600', color: '#1D4ED8' }}>
              {item.status}
            </Text>
          </View>
        )}
      </View>
      {!!item.phoneNumber && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Phone size={14} color='#64748B' />
          <Text style={{ fontSize: 14, color: '#475569', marginLeft: 6 }}>
            {item.phoneNumber}
          </Text>
        </View>
      )}
      {!!item.email && (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Mail size={14} color='#64748B' />
          <Text style={{ fontSize: 14, color: '#475569', marginLeft: 6 }}>
            {item.email}
          </Text>
        </View>
      )}
    </View>
  );

  if (checkingAuth) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(255,255,255,0.85)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: '#FFFFFF',
            paddingHorizontal: 20,
            paddingVertical: 14,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#E2E8F0',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
          }}
        >
          <ActivityIndicator size='small' color='#0F172A' />
          <Text
            style={{
              color: '#0F172A',
              fontSize: 14,
              fontWeight: '600',
              marginLeft: 10,
            }}
          >
            Verificando sessão...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar style='dark' />
      <View
        style={{
          backgroundColor: '#FFFFFF',
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
          paddingBottom: 20,
          borderBottomWidth: 1,
          borderBottomColor: '#E2E8F0',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginRight: 16 }}
            >
              <ArrowLeft size={24} color='#1E293B' />
            </TouchableOpacity>
            <View>
              <Text
                style={{ fontSize: 24, fontWeight: 'bold', color: '#1E293B' }}
              >
                Alunos
              </Text>
              <Text style={{ fontSize: 14, color: '#64748B', marginTop: 2 }}>
                {filtered.length} aluno{filtered.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/students/add')}
            style={{
              backgroundColor: '#3B82F6',
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <GraduationCap size={18} color='#FFFFFF' />
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: '600',
                marginLeft: 6,
              }}
            >
              Adicionar
            </Text>
          </TouchableOpacity>
        </View>

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
          <Search size={20} color='#64748B' />
          <TextInput
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 12,
              fontSize: 16,
              color: '#1E293B',
            }}
            placeholder='Buscar alunos...'
            placeholderTextColor='#94A3B8'
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: insets.bottom + 100,
        }}
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          const diff = y - lastOffset.current;
          if (diff > 8 && !hiddenRef.current) hiddenRef.current = true;
          else if (diff < -8 && hiddenRef.current) hiddenRef.current = false;
          lastOffset.current = y;
        }}
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 60,
            }}
          >
            {loadingList ? (
              <ActivityIndicator size='large' color='#3B82F6' />
            ) : (
              <GraduationCap size={48} color='#94A3B8' />
            )}
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#64748B',
                marginTop: 12,
              }}
            >
              {loadingList ? 'Carregando alunos...' : 'Nenhum aluno encontrado'}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#94A3B8',
                textAlign: 'center',
                marginTop: 4,
                paddingHorizontal: 40,
              }}
            >
              {searchQuery
                ? 'Tente ajustar sua busca'
                : 'Cadastre o primeiro aluno para começar'}
            </Text>
          </View>
        }
      />
    </View>
  );
}
