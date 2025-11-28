import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Building2,
  Edit,
  Eye,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  ListRenderItem,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../../../lib/api';

// Tipagem da escola
interface School {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  phoneNumber: string;
  email: string;
  isActive: boolean;
  totalStudents: number;
}

export default function SchoolsScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const lastOffset = useRef(0);
  const hiddenRef = useRef(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [schools, setSchools] = useState<School[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const footerTranslate = useRef(new Animated.Value(0)).current;
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const flag = await AsyncStorage.getItem('auth:logged_in');
        if (flag !== 'true') {
          router.replace('/');
        }
      } catch {}
      setCheckingAuth(false);
    })();
  }, []);

  useEffect(() => {
    if (checkingAuth) return;
    (async () => {
      try {
        const data = await api.get('/schools');
        const list: School[] = Array.isArray(data)
          ? data.map((d: any) => ({
              id: String(d.id ?? d._id ?? ''),
              name: d.name,
              code: d.code,
              address: d.address,
              city: d.city,
              state: d.State ?? d.state,
              phoneNumber: d.phone_number ?? d.phoneNumber ?? '',
              email: d.email ?? '',
              isActive: d.is_active ?? d.isActive ?? true,
              totalStudents: d.total_students ?? d.totalStudents ?? 0,
            }))
          : [];
        setSchools(list);
      } catch {
        setSchools([]);
      } finally {
        setLoadingList(false);
      }
    })();
  }, [checkingAuth]);

  const filteredSchools = schools.filter(
    (school) =>
      school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setTimeout(async () => {
      try {
        await AsyncStorage.removeItem('auth:logged_in');
      } catch {}
      setLoggingOut(false);
      router.replace('/');
    }, 1000);
  };

  const renderSchoolCard: ListRenderItem<School> = ({ item: school }) => (
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
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 4,
            }}
          >
            <Building2 size={18} color='#3B82F6' />
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#1E293B',
                marginLeft: 8,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {school.name}
            </Text>
            <View
              style={{
                backgroundColor: school.isActive ? '#DEF7EC' : '#FEE2E2',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '600',
                  color: school.isActive ? '#065F46' : '#991B1B',
                }}
              >
                {school.isActive ? 'ATIVA' : 'INATIVA'}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '500' }}>
            Código: {school.code}
          </Text>
        </View>
      </View>

      {/* Informações */}
      <View style={{ marginBottom: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <MapPin size={14} color='#64748B' />
          <Text
            style={{ fontSize: 14, color: '#475569', marginLeft: 6, flex: 1 }}
            numberOfLines={1}
          >
            {school.address}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Phone size={14} color='#64748B' />
          <Text style={{ fontSize: 14, color: '#475569', marginLeft: 6 }}>
            {school.phoneNumber}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Mail size={14} color='#64748B' />
          <Text style={{ fontSize: 14, color: '#475569', marginLeft: 6 }}>
            {school.email}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
        }}
      >
        <Text style={{ fontSize: 12, color: '#64748B' }}>
          <Text style={{ fontWeight: '600' }}>{school.totalStudents}</Text>{' '}
          alunos
        </Text>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.push(`/schools/list-school/${school.id}`)}
            style={{
              backgroundColor: '#F8FAFC',
              padding: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#E2E8F0',
            }}
          >
            <Eye size={16} color='#64748B' />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (!school.id) {
                Alert.alert(
                  'ID indisponível',
                  'Não é possível editar esta escola'
                );
                return;
              }
              router.push(`/schools/edit-school/${school.id}`);
            }}
            disabled={!school.id}
            style={{
              backgroundColor: '#F8FAFC',
              padding: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#E2E8F0',
            }}
          >
            <Edit size={16} color='#64748B' />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              setConfirmDelete({ id: school.id, name: school.name })
            }
            disabled={deletingId === school.id}
            style={{
              backgroundColor: '#F8FAFC',
              padding: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#E2E8F0',
            }}
          >
            {deletingId === school.id ? (
              <ActivityIndicator size='small' color='#DC2626' />
            ) : (
              <Trash2 size={16} color='#DC2626' />
            )}
          </TouchableOpacity>
        </View>
      </View>
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

      {/* Header */}
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
          <View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#1E293B',
              }}
            >
              Escolas
            </Text>
            <Text style={{ fontSize: 14, color: '#64748B', marginTop: 2 }}>
              {filteredSchools.length} escola
              {filteredSchools.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <View />
        </View>

        {/* Search Bar */}
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
            placeholder='Buscar escolas...'
            placeholderTextColor='#94A3B8'
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Schools List */}
      <FlatList
        data={filteredSchools}
        renderItem={renderSchoolCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: insets.bottom + 180,
        }}
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          const diff = y - lastOffset.current;
          if (diff > 8 && !hiddenRef.current) {
            hiddenRef.current = true;
            Animated.timing(footerTranslate, {
              toValue: 100,
              duration: 220,
              useNativeDriver: true,
            }).start();
          } else if (diff < -8 && hiddenRef.current) {
            hiddenRef.current = false;
            Animated.timing(footerTranslate, {
              toValue: 0,
              duration: 220,
              useNativeDriver: true,
            }).start();
          }
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
              <Building2 size={48} color='#94A3B8' />
            )}
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#64748B',
                marginTop: 12,
              }}
            >
              {loadingList
                ? 'Carregando escolas...'
                : 'Nenhuma escola encontrada'}
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
                : 'Cadastre a primeira escola para começar'}
            </Text>
          </View>
        }
      />

      <Animated.View
        style={{
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: insets.bottom + 4,
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 12,
          borderWidth: 1,
          borderColor: '#E2E8F0',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
          transform: [{ translateY: footerTranslate }],
        }}
      >
        <TouchableOpacity
          onPress={() => router.push('/students')}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 10,
            borderRadius: 10,
            backgroundColor: '#10B981',
          }}
        >
          <User size={18} color='#FFFFFF' />
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: '600',
              marginLeft: 6,
            }}
          >
            Alunos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/schools/add')}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 10,
            borderRadius: 10,
            backgroundColor: '#3B82F6',
          }}
        >
          <Plus size={18} color='#FFFFFF' />
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: '600',
              marginLeft: 6,
            }}
          >
            Escola
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          disabled={loggingOut}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 10,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: loggingOut ? '#E2E8F0' : '#FECACA',
            backgroundColor: '#FFFFFF',
          }}
        >
          {loggingOut ? (
            <ActivityIndicator size='small' color='#DC2626' />
          ) : (
            <LogOut size={18} color='#DC2626' />
          )}
          <Text
            style={{
              color: '#DC2626',
              fontSize: 14,
              fontWeight: '600',
              marginLeft: 6,
            }}
          >
            {loggingOut ? 'Deslogando...' : 'Sair'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={Boolean(confirmDelete)}
        transparent
        animationType='fade'
        onRequestClose={() => setConfirmDelete(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#E2E8F0',
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B' }}>
              Excluir escola
            </Text>
            <Text style={{ fontSize: 14, color: '#475569', marginTop: 6 }}>
              Deseja realmente excluir {confirmDelete?.name}?
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                gap: 12,
                marginTop: 16,
              }}
            >
              <TouchableOpacity
                onPress={() => setConfirmDelete(null)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <Text
                  style={{ color: '#334155', fontSize: 14, fontWeight: '600' }}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  if (!confirmDelete || deletingId) return;
                  setDeletingId(confirmDelete.id);
                  try {
                    await api.del(`/schools/${confirmDelete.id}`);
                    setSchools((prev) =>
                      prev.filter((s) => s.id !== confirmDelete.id)
                    );
                    setConfirmDelete(null);
                  } catch {
                    Alert.alert('Erro', 'Falha ao excluir escola');
                  } finally {
                    setDeletingId(null);
                  }
                }}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 10,
                  backgroundColor: '#DC2626',
                }}
              >
                <Text
                  style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}
                >
                  Excluir
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {loggingOut && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
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
              Deslogando...
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
