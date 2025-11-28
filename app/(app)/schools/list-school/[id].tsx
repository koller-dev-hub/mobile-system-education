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
  Trash2,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../../../../lib/api';
import styles from './styles';

interface SchoolDetail {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  phoneNumber: string;
  email: string;
  isActive: boolean;
  description?: string;
}

export default function SchoolDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState<SchoolDetail | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const flag = await AsyncStorage.getItem('auth:logged_in');
        if (flag !== 'true') {
          router.replace('/');
          return;
        }
      } catch {}
      setCheckingAuth(false);
    })();
  }, []);

  useEffect(() => {
    if (checkingAuth) return;
    (async () => {
      try {
        const data = await api.get(`/schools/${id}`);
        const mapped: SchoolDetail = {
          id: String(data.id ?? id),
          name: data.name,
          code: data.code,
          address: data.address,
          city: data.city,
          state: data.State ?? data.state,
          phoneNumber: data.phone_number ?? data.phoneNumber ?? '',
          email: data.email ?? '',
          isActive: data.is_active ?? data.isActive ?? true,
          description: data.description ?? '',
        };
        setSchool(mapped);
      } catch {
        setSchool(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [checkingAuth, id]);

  if (checkingAuth) {
    return (
      <View style={styles.loadingScreenDark}>
        <View style={styles.loadingBoxDark}>
          <ActivityIndicator size='small' color='#FFFFFF' />
          <Text style={styles.loadingTextDark}>Verificando sessão...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style='dark' />

      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButtonLight}
        >
          <ArrowLeft size={24} color='#0F172A' />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitleDark}>Escola</Text>
          <Text style={styles.headerSubtitleDark}>Visualização da escola</Text>
        </View>
        {school && (
          <TouchableOpacity
            onPress={() => setConfirmDelete(true)}
            disabled={deleting}
            style={{
              backgroundColor: '#F8FAFC',
              padding: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#E2E8F0',
            }}
          >
            {deleting ? (
              <ActivityIndicator size='small' color='#DC2626' />
            ) : (
              <Trash2 size={18} color='#DC2626' />
            )}
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.detailScroll}>
        {loading ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator size='large' color='#3B82F6' />
          </View>
        ) : !school ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              Não foi possível carregar a escola.
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Building2 size={20} color='#3B82F6' />
              <Text style={styles.cardTitle}>{school.name}</Text>
              <View
                style={[
                  styles.badge,
                  school.isActive ? styles.badgeActive : styles.badgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    school.isActive
                      ? styles.badgeTextActive
                      : styles.badgeTextInactive,
                  ]}
                >
                  {school.isActive ? 'ATIVA' : 'INATIVA'}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <Hash size={14} color='#64748B' />
              <Text style={styles.rowText}>Código: {school.code}</Text>
            </View>

            <View style={styles.row}>
              <MapPin size={14} color='#64748B' />
              <Text style={styles.rowText}>{school.address}</Text>
            </View>

            <View style={styles.row}>
              <MapPin size={14} color='#64748B' />
              <Text style={styles.rowText}>
                {school.city} - {school.state}
              </Text>
            </View>

            <View style={styles.row}>
              <Phone size={14} color='#64748B' />
              <Text style={styles.rowText}>{school.phoneNumber}</Text>
            </View>

            <View style={styles.row}>
              <Mail size={14} color='#64748B' />
              <Text style={styles.rowText}>{school.email}</Text>
            </View>

            {school.description ? (
              <View style={styles.descriptionBox}>
                <Text style={styles.sectionTitle}>Descrição</Text>
                <Text style={styles.descriptionText}>{school.description}</Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={confirmDelete}
        transparent
        animationType='fade'
        onRequestClose={() => setConfirmDelete(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            paddingHorizontal: 20,
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
              Deseja realmente excluir {school?.name}?
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
                onPress={() => setConfirmDelete(false)}
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
                  if (deleting) return;
                  setDeleting(true);
                  try {
                    await api.del(`/schools/${id}`);
                    setConfirmDelete(false);
                    Alert.alert('Sucesso', 'Escola excluída com sucesso');
                    router.back();
                  } catch {
                    Alert.alert('Erro', 'Falha ao excluir escola');
                  } finally {
                    setDeleting(false);
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
    </View>
  );
}
