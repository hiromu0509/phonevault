import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
  onSnapshot,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, COMMISSION_AED } from "@/lib/constants";
import { InventoryItem, Reservation, AppUser, ParsedInventoryItem } from "@/types";

function fromFirestore<T>(doc: any): T {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    importedAt: data.importedAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  } as T;
}

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const ref = doc(db, COLLECTIONS.USERS, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return fromFirestore<AppUser>(snap);
}

export async function getAllUsers(): Promise<AppUser[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.USERS));
  return snap.docs.map((d) => fromFirestore<AppUser>(d));
}

export async function updateUserApproval(uid: string, approved: boolean) {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), { approved });
}

export async function updateUserRole(uid: string, role: "admin" | "buyer") {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), { role });
}

export async function getInventory(statusFilter?: string): Promise<InventoryItem[]> {
  const constraints: QueryConstraint[] = [orderBy("importedAt", "desc")];
  if (statusFilter && statusFilter !== "all") {
    constraints.unshift(where("status", "==", statusFilter));
  }
  const q = query(collection(db, COLLECTIONS.INVENTORY), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => fromFirestore<InventoryItem>(d));
}

export function subscribeToInventory(
  callback: (items: InventoryItem[]) => void
) {
  const q = query(
    collection(db, COLLECTIONS.INVENTORY),
    orderBy("importedAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => fromFirestore<InventoryItem>(d)));
  });
}

export async function importInventoryBatch(
  items: ParsedInventoryItem[],
  adminUid: string
) {
  const batch = writeBatch(db);
  items.forEach((item) => {
    const ref = doc(collection(db, COLLECTIONS.INVENTORY));
    batch.set(ref, {
      model: item.model,
      storage: item.storage,
      color: item.color,
      grade: item.grade,
      quantity: item.quantity,
      availableQty: item.quantity,
      sellerPrice: item.sellerPrice,
      buyerPrice: item.sellerPrice + COMMISSION_AED,
      status: "available",
      importedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      importedBy: adminUid,
      notes: "",
      flag: item.flag ?? null,
      country: item.country ?? null,
    });
  });
  await batch.commit();
}

export async function updateInventoryItem(
  id: string,
  data: Partial<InventoryItem>
) {
  await updateDoc(doc(db, COLLECTIONS.INVENTORY, id), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteInventoryItem(id: string) {
  await deleteDoc(doc(db, COLLECTIONS.INVENTORY, id));
}

export async function createReservation(
  item: InventoryItem,
  quantity: number,
  buyer: AppUser
): Promise<string> {
  if (item.availableQty < quantity) throw new Error("Not enough stock");

  const resRef = await addDoc(collection(db, COLLECTIONS.RESERVATIONS), {
    inventoryItemId: item.id,
    inventorySnapshot: {
      model: item.model,
      storage: item.storage,
      grade: item.grade,
      color: item.color,
      buyerPrice: item.buyerPrice,
    },
    quantity,
    totalPrice: item.buyerPrice * quantity,
    buyerUid: buyer.uid,
    buyerName: buyer.displayName,
    buyerCompany: buyer.companyName,
    status: "pending",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  const newAvailable = item.availableQty - quantity;
  await updateDoc(doc(db, COLLECTIONS.INVENTORY, item.id), {
    availableQty: newAvailable,
    status: newAvailable === 0 ? "reserved" : "available",
    updatedAt: Timestamp.now(),
  });

  return resRef.id;
}

export async function getReservations(buyerUid?: string): Promise<Reservation[]> {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
  if (buyerUid) constraints.unshift(where("buyerUid", "==", buyerUid));
  const q = query(collection(db, COLLECTIONS.RESERVATIONS), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => fromFirestore<Reservation>(d));
}

export function subscribeToReservations(
  buyerUid: string | null,
  callback: (items: Reservation[]) => void
) {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
  if (buyerUid) constraints.unshift(where("buyerUid", "==", buyerUid));
  const q = query(collection(db, COLLECTIONS.RESERVATIONS), ...constraints);
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => fromFirestore<Reservation>(d)));
  });
}

export async function updateReservationStatus(
  reservationId: string,
  status: "confirmed" | "cancelled" | "sold",
  inventoryItemId: string,
  quantity: number
) {
  const batch = writeBatch(db);

  batch.update(doc(db, COLLECTIONS.RESERVATIONS, reservationId), {
    status,
    updatedAt: Timestamp.now(),
  });

  if (status === "cancelled") {
    const invRef = doc(db, COLLECTIONS.INVENTORY, inventoryItemId);
    const invSnap = await getDoc(invRef);
    if (invSnap.exists()) {
      const data = invSnap.data();
      const restored = data.availableQty + quantity;
      batch.update(invRef, {
        availableQty: restored,
        status: restored > 0 ? "available" : "reserved",
        updatedAt: Timestamp.now(),
      });
    }
  }

  if (status === "sold") {
    batch.update(doc(db, COLLECTIONS.INVENTORY, inventoryItemId), {
      status: "sold",
      updatedAt: Timestamp.now(),
    });
  }

  await batch.commit();
}