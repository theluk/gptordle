import {
  DocumentData,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";

export function docExists<T extends DocumentData = DocumentData>(
  doc: DocumentSnapshot<T> | QueryDocumentSnapshot<T> | undefined | null
): doc is QueryDocumentSnapshot<T> {
  return !!doc && doc.exists;
}
