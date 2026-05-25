import { StyleSheet } from 'react-native';

export const publicMenuStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  menuTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  menuDescription: {
    fontSize: 16,
    marginBottom: 16,
  },
  content: {
    padding: 20,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryImage: {
    marginBottom: 12,
  },
  categoryVideo: {
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  menuItemCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  itemImage: {
    marginBottom: 10,
  },
  itemVideo: {
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
