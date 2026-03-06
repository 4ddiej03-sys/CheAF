import React, { useState } from "react";
import { View, Text, TextInput, Button, FlatList } from "react-native";

export default function PantryScreen() {
  const [ingredient, setIngredient] = useState("");
  const [pantry, setPantry] = useState([]);

  const addIngredient = () => {
    if (!ingredient) return;
    setPantry([...pantry, ingredient]);
    setIngredient("");
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>My Pantry 🧺</Text>

      <TextInput
        placeholder="Add ingredient..."
        value={ingredient}
        onChangeText={setIngredient}
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
      />

      <Button title="Add" onPress={addIngredient} />

      <FlatList
        data={pantry}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Text>• {item}</Text>}
      />
    </View>
  );
}
