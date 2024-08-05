const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

// Firestore database instance
const db = admin.firestore();

// Check if the code is running in the emulator
if (process.env.FUNCTIONS_EMULATOR) {
    db.settings({
      host: "localhost:8080",
      ssl: false
    });
}

/**
 * Adds a new pantry item.
 * Trigger: Callable
 * @param {Object} data - Data containing item details.
 * @param {string} data.name - Name of the item.
 * @param {number} data.quantity - Quantity of the item.
 * @param {string} data.unit - Unit of the item (e.g., kg, liters).
 * @param {string} data.expiryDate - Expiry date of the item.
 * @param {string} data.category - Category of the item (e.g., vegetables, dairy).
 * @returns {Object} - Success message.
 */
exports.addPantryItem = functions.https.onCall(async (data, context) => {
  try {
    const { name, quantity, unit, expiryDate, category } = data;

    // Validate input data
    if (!name || !quantity || !unit || !expiryDate || !category) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields.');
    }

    console.log('Data received:', data);

    const newItem = {
      name,
      quantity,
      unit,
      expiryDate,  // Store expiryDate as a string
      category,
    };

    await db.collection('pantry').add(newItem);
    return { message: 'Item added successfully' };
  } catch (error) {
    console.error('Error adding pantry item:', error);
    throw new functions.https.HttpsError('internal', 'Unable to add pantry item.');
  }
});

/**
 * Retrieves all pantry items.
 * Trigger: Callable
 * @returns {Object} - List of pantry items.
 */
exports.getPantryItems = functions.https.onCall(async (data, context) => {
  try {
    const snapshot = await db.collection('pantry').get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { items };
  } catch (error) {
    console.error('Error retrieving pantry items:', error);
    throw new functions.https.HttpsError('internal', 'Unable to retrieve pantry items.');
  }
});

/**
 * Updates an existing pantry item.
 * Trigger: Callable
 * @param {Object} data - Data containing item ID and updated details.
 * @param {string} data.id - ID of the item to update.
 * @param {Object} data.updatedData - Updated item details.
 * @returns {Object} - Success message.
 */
exports.updatePantryItem = functions.https.onCall(async (data, context) => {
  try {
    const { id, updatedData } = data;

    // Validate input data
    if (!id || !updatedData) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields.');
    }

    console.log('Update Data received:', updatedData);

    await db.collection('pantry').doc(id).update(updatedData);
    return { message: 'Item updated successfully' };
  } catch (error) {
    console.error('Error updating pantry item:', error);
    throw new functions.https.HttpsError('internal', 'Unable to update pantry item.');
  }
});

/**
 * Deletes a pantry item.
 * Trigger: Callable
 * @param {Object} data - Data containing the item ID.
 * @param {string} data.id - ID of the item to delete.
 * @returns {Object} - Success message.
 */
exports.deletePantryItem = functions.https.onCall(async (data, context) => {
  try {
    const { id } = data;

    // Validate input data
    if (!id) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields.');
    }

    await db.collection('pantry').doc(id).delete();
    return { message: 'Item deleted successfully' };
  } catch (error) {
    console.error('Error deleting pantry item:', error);
    throw new functions.https.HttpsError('internal', 'Unable to delete pantry item.');
  }
});
