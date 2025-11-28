import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonLight: {
    marginRight: 8,
    padding: 6,
  },
  headerTitleDark: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  headerSubtitleDark: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  detailScroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  loadingCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: '#DEF7EC',
  },
  badgeInactive: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  badgeTextActive: {
    color: '#065F46',
  },
  badgeTextInactive: {
    color: '#991B1B',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rowText: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 6,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 12,
    marginBottom: 6,
  },
  descriptionBox: {
    marginTop: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  loadingScreenDark: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBoxDark: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingTextDark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default styles;
