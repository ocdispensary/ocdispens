import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Linking, Modal, Pressable, StyleSheet, View } from 'react-native';
import Swiper from 'react-native-swiper';

/**
 * -----------------------------------------------------------------------------
 *  HomeScreen  – Converted from legacy HTML/CSS/JS assets (menu.html, index.html)
 * -----------------------------------------------------------------------------
 *  • Categories grid ➜ FlatList (2‑col responsive)
 *  • Top‑sellers carousel ➜ react‑native‑swiper
 *  • Age‑gate overlay ➜ AsyncStorage‑backed modal
 *
 *  Assets are loaded from their original GitHub pages so you can drop this file
 *  straight into an Expo Router project (app/(tabs)/index.tsx) and see data
 *  immediately without bundling extra JSON.
 * -------------------------------------------------------------------------- */

// -----------------------------------------------------------------------------
// Web polyfill: react‑native‑swiper relies on global.setImmediate which doesn’t
// exist in browsers. Provide a minimal shim so it works on Expo Web.
// -----------------------------------------------------------------------------
setTimeout(() => console.log('there'));
console.log('hello');


const REMOTE_BASE = 'https://ocdispensary.github.io/oc-dispensary';
const CATEGORIES_URL = `${REMOTE_BASE}/categories.json`;
const TOP_SELLERS_URL = `${REMOTE_BASE}/top_sellers.json`;
const AGE_KEY = 'is21';

type Category = {
  name: string;
  img: string;
  link: string;
};

type Product = {
  name: string;
  img: string;
  brand: string;
  link: string;
  price: string;
};

export default function HomeScreen() {
  /* -------------------- state -------------------- */
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [ageGateVisible, setAgeGateVisible] = useState(false);

  /* -------------------- effects -------------------- */
  useEffect(() => {
    fetch(CATEGORIES_URL)
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);

    fetch(TOP_SELLERS_URL)
      .then((r) => r.json())
      .then((data: Product[]) => {
        // simple Fisher‑Yates shuffle (to match original behaviour)
        for (let i = data.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [data[i], data[j]] = [data[j], data[i]];
        }
        setProducts(data);
      })
      .catch(console.error);
  }, []);

  /*  Show age‑gate once per install  */
  useEffect(() => {
    (async () => {
      const accepted = await AsyncStorage.getItem(AGE_KEY);
      if (accepted !== 'true') setAgeGateVisible(true);
    })();
  }, []);

  /* -------------------- handlers -------------------- */
  const openUrl = useCallback((url: string) => Linking.openURL(url), []);

  /* -------------------- render -------------------- */
  return (
    <>
      {/* ------------------ Age verification modal ------------------ */}
      <Modal visible={ageGateVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <ThemedText type="title" style={{ marginBottom: 16 }}>
              Are you 21 or older?
            </ThemedText>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.button, styles.success]}
                onPress={async () => {
                  await AsyncStorage.setItem(AGE_KEY, 'true');
                  setAgeGateVisible(false);
                }}>
                <ThemedText style={styles.buttonLabel}>Yes</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.button, styles.danger]}
                onPress={() => Linking.openURL('https://google.com')}>
                <ThemedText style={styles.buttonLabel}>No</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ------------------ Main content (scrollable) ------------------ */}
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image
            source={require('@/assets/images/partial-react-logo.png')}
            style={styles.reactLogo}
          />
        }>
        {/* ---------------- Welcome banner ------------- */}
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Welcome!</ThemedText>
        </ThemedView>

        {/* --------------- Categories grid ------------- */}
        <ThemedText type="subtitle" style={{ marginTop: 24, marginBottom: 8 }}>
          Shop by Category
        </ThemedText>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.link}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => openUrl(item.link)}
              style={styles.tile}>
              <Image
                source={{ uri: item.img }}
                style={styles.tileImage}
                contentFit="contain"
              />
              <ThemedText style={styles.tileTitle}>{item.name}</ThemedText>
            </Pressable>
          )}
          scrollEnabled={false}
        />

        {/* --------------- Top sellers ---------------- */}
        <ThemedText type="subtitle" style={{ marginTop: 32, marginBottom: 8 }}>
          Top Sellers
        </ThemedText>
        {products.length > 0 && (
          <Swiper
            style={{ height: 260 }}
            paginationStyle={{ bottom: -20 }}
            autoplay
            showsPagination
            loop
            showsButtons
            dotColor="#999"
            activeDotColor="#e3cba2">
            {products.map((p) => (
              <Pressable
                key={p.link}
                onPress={() => openUrl(p.link)}
                style={styles.slide}>
                <Image source={{ uri: p.img }} style={styles.productImage} />
                <ThemedText style={styles.productName}>{p.name}</ThemedText>
                <ThemedText style={styles.productBrand}>{p.brand}</ThemedText>
                <ThemedText style={styles.productPrice}>{p.price}</ThemedText>
              </Pressable>
            ))}
          </Swiper>
        )}
      </ParallaxScrollView>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   styles                                   */
/* -------------------------------------------------------------------------- */

const palette = {
  tileBg: '#031428',
  tileAccent: '#d5aa5f',
  boxBg: '#040c17',
};

const styles = StyleSheet.create({
  /* --- modal --- */
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 24,
    maxWidth: 380,
    width: '90%',
    alignItems: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  success: { backgroundColor: '#28a745' },
  danger: { backgroundColor: '#dc3545' },
  buttonLabel: { color: '#fff', fontWeight: '600' },

  /* --- parallax header image --- */
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },

  /* --- banner --- */
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },

  /* --- categories --- */
  tile: {
    backgroundColor: palette.tileBg,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginBottom: 16,
    marginHorizontal: 4,
  },
  tileImage: {
    width: '70%',
    aspectRatio: 1,
    borderRadius: 15,
    marginBottom: 12,
  },
  tileTitle: {
    color: palette.tileAccent,
    textAlign: 'center',
    fontSize: 14,
  },

  /* --- products --- */
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  productImage: {
    width: 110,
    height: 110,
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    textAlign: 'center',
    color: '#fff',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: palette.tileAccent,
    marginTop: 4,
  },
});
