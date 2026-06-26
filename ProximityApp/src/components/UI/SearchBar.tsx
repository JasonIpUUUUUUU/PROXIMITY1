import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Platform,
} from 'react-native';
import { theme } from '../../utils/theme';
import { debounce } from '../../utils/helpers';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  hint?: string;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search bar, pub, quick munch...',
  hint = 'Search a category to discover places near you',
  initialValue = '',
}) => {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  const handleChangeText = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };

  const debouncedSearch = useCallback(
    debounce((text: string) => {
      onSearch(text);
    }, 300),
    [onSearch]
  );

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.searchWrapper, isFocused && styles.searchWrapperFocused]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          value={query}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    right: 20,
    zIndex: 100,
    alignItems: 'center',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 13, 46, 0.93)',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 6,
    width: '100%',
    maxWidth: 520,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  searchWrapperFocused: {
    borderColor: theme.colors.primaryDark,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.5,
  },
  searchIcon: {
    fontSize: 18,
    opacity: 0.65,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textTitle,
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    color: theme.colors.textMuted,
    fontSize: 16,
  },
  hint: {
    color: '#a892d4',
    fontSize: 12,
    marginTop: 8,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
});

export default SearchBar;