import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { formatCurrency } from './calculations';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/** Infos émetteur (personnalisables) */
const EMETTEUR = {
  nom: 'Ma Société',
  adresse: '123 Avenue des Affaires',
  cp_ville: '20000 Casablanca',
  tel: '+212 5XX XX XX XX',
  email: 'contact@masociete.ma',
  site: 'www.masociete.ma',
  rc: 'RC: 12345 · ICE: 12345678900001',
  rib: 'MA64 011 0000 0000 0000 0000 00',
  banque: 'Banque Populaire'
};

const ACCENT_COLOR = [240, 180, 41]; // Jaune accent #F0B429 (cohérent app)
const TEXT_COLOR = [30, 41, 59]; // Slate 800
const LIGHT_TEXT = [100, 116, 139]; // Slate 500

/**
 * Génère un PDF Premium de la facture
 * @param {Object} facture - Facture Firebase (numero, date_creation, articles, total_ht, tva, total_ttc, statut)
 * @param {Object} client - Client Firebase (nom, email, tel, adresse)
 * @param {Array} articles - Lignes de la facture (facture.articles)
 */
export function generateInvoicePDF(facture, client, articles = []) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  let y = 0;

  // --- Bandeau supérieur profilé ---
  doc.setFillColor(...ACCENT_COLOR);
  doc.rect(0, 0, pageWidth, 4, 'F');
  y += 20;

  // --- En-tête : gauche = société, droite = bloc facture ---
  const safeNumero = facture.numero || 'FAC-XXXX';
  const dateStr = facture.date_creation
    ? format(
        typeof facture.date_creation === 'number'
          ? new Date(facture.date_creation)
          : facture.date_creation,
        'dd MMMM yyyy',
        { locale: fr }
      )
    : '—';

  // Gauche : nom société
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...ACCENT_COLOR);
  doc.text(EMETTEUR.nom, 15, y);

  // Droite : bloc facture (éviter tout chevauchement)
  const blocRight = pageWidth - 15;
  const blocLeft = 120; // zone réservée aux labels
  doc.setFontSize(24);
  doc.setTextColor(...TEXT_COLOR);
  doc.text('FACTURE', blocRight, y, { align: 'right' });
  y += 10;

  // N° et Date : label à gauche du bloc, valeur à droite — pas de chevauchement
  doc.setFontSize(9);
  doc.setTextColor(...LIGHT_TEXT);
  doc.setFont('helvetica', 'normal');
  doc.text('N°', blocLeft, y);
  doc.setTextColor(...TEXT_COLOR);
  doc.setFont('helvetica', 'bold');
  doc.text(safeNumero, blocRight, y, { align: 'right' });
  y += 7;

  doc.setTextColor(...LIGHT_TEXT);
  doc.setFont('helvetica', 'normal');
  doc.text('Date', blocLeft, y);
  doc.setTextColor(...TEXT_COLOR);
  doc.setFont('helvetica', 'bold');
  doc.text(dateStr, blocRight, y, { align: 'right' });
  
  // Ligne de séparation
  y += 15;
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.line(15, y, pageWidth - 15, y);
  y += 10;

  // --- Blocs Émetteur | Client ---
  const colWidth = (pageWidth - 30) / 2;

  // Titres des blocs
  doc.setFontSize(9);
  doc.setTextColor(...LIGHT_TEXT);
  doc.setFont('helvetica', 'bold');
  doc.text('ÉMETTEUR', 15, y);
  doc.text('FACTURÉ À', 15 + colWidth, y);
  y += 6;

  // Contenu des blocs
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_COLOR);
  
  // Emetteur
  doc.setFont('helvetica', 'bold');
  doc.text(EMETTEUR.nom, 15, y);
  doc.setFont('helvetica', 'normal');
  doc.text(EMETTEUR.adresse, 15, y + 5);
  doc.text(EMETTEUR.cp_ville, 15, y + 10);
  doc.text(EMETTEUR.tel, 15, y + 15);
  doc.text(EMETTEUR.email, 15, y + 20);

  // Client
  doc.setFont('helvetica', 'bold');
  doc.text(client?.nom || 'Client Anonyme', 15 + colWidth, y);
  doc.setFont('helvetica', 'normal');
  if (client?.adresse) {
    const splitAdresse = doc.splitTextToSize(client.adresse, colWidth - 5);
    doc.text(splitAdresse, 15 + colWidth, y + 5);
  } else {
    doc.text('—', 15 + colWidth, y + 5);
  }
  let offsetY = y + 15;
  if (client?.email) {
    doc.text(client.email, 15 + colWidth, offsetY);
    offsetY += 5;
  }
  if (client?.tel) {
    doc.text(client.tel, 15 + colWidth, offsetY);
  }
  
  y = Math.max(y + 30, offsetY + 10);

  // --- Tableau articles ---
  const lignes = (articles || []).map((a) => {
    const totalLigne =
      a.total_ligne ?? (a.qte || 0) * (a.prix_unitaire || 0) * (1 - ((a.remise || 0) / 100));
    return [
      a.designation || 'Désignation',
      String(a.qte || 0),
      formatCurrency(a.prix_unitaire || 0),
      a.remise ? `${a.remise}%` : '-',
      formatCurrency(totalLigne),
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['Description', 'Qté', 'Prix unitaire', 'Remise', 'Total']],
    body: lignes,
    theme: 'plain',
    headStyles: { 
      fillColor: [248, 250, 252], // Slate 50
      textColor: LIGHT_TEXT, 
      fontStyle: 'bold',
      fontSize: 9
    },
    styles: { 
      fontSize: 9,
      textColor: TEXT_COLOR,
      cellPadding: 5,
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 15, right: 15 },
    didDrawCell: (data) => {
      // Séparateur fin en bas des lignes
      if (data.row.section === 'body') {
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.1);
        doc.line(
          data.cell.x,
          data.cell.y + data.cell.height,
          data.cell.x + data.cell.width,
          data.cell.y + data.cell.height
        );
      }
    }
  });

  y = doc.lastAutoTable.finalY + 15;

  // --- Bloc totaux ---
  doc.setFontSize(10);
  const totalXOffset = pageWidth - 65;
  const valueXOffset = pageWidth - 15;

  // Sous-total
  doc.setTextColor(...LIGHT_TEXT);
  doc.setFont('helvetica', 'normal');
  doc.text('Total HT', totalXOffset, y);
  doc.setTextColor(...TEXT_COLOR);
  doc.text(formatCurrency(facture.total_ht || 0), valueXOffset, y, { align: 'right' });
  y += 7;

  // TVA
  doc.setTextColor(...LIGHT_TEXT);
  doc.text('TVA', totalXOffset, y);
  doc.setTextColor(...TEXT_COLOR);
  doc.text(formatCurrency(facture.tva || 0), valueXOffset, y, { align: 'right' });
  y += 7;

  // Ligne avant total TTC
  doc.setDrawColor(226, 232, 240);
  doc.line(totalXOffset, y, valueXOffset, y);
  y += 7;

  // Total TTC structuré (Boîte colorée légère)
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.rect(totalXOffset - 5, y - 5, 60, 12, 'F');
  
  doc.setTextColor(...TEXT_COLOR);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total TTC', totalXOffset, y + 3);
  doc.setTextColor(...ACCENT_COLOR);
  doc.text(formatCurrency(facture.total_ttc || 0), valueXOffset, y + 3, { align: 'right' });
  
  y += 20;

  // --- Informations complémentaires (Statut, Modalités) ---
  let bottomY = pageHeight - 40;
  
  // Si le tableau est très long et déborde, forcer le bottomY à la baisse ou prendre la position actuelle
  if (y > bottomY - 20) {
    bottomY = y + 20;
  }
  
  // Statut
  const statutLabels = { EN_ATTENTE: 'En attente', PAYEE: 'Payée', REJETEE: 'Rejetée' };
  const statut = statutLabels[facture.statut] || facture.statut || '—';
  
  // Badge de statut stylisé
  let statutColor = LIGHT_TEXT;
  if (facture.statut === 'PAYEE') statutColor = [34, 197, 94]; // Green 500
  if (facture.statut === 'REJETEE') statutColor = [239, 68, 68]; // Red 500
  if (facture.statut === 'EN_ATTENTE') statutColor = [245, 158, 11]; // Amber 500
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...statutColor);
  doc.text(`Statut de la facture : ${statut.toUpperCase()}`, 15, doc.lastAutoTable.finalY + 15);

  // Zone de signature (rectangle discret à droite)
  const sigX = pageWidth - 65;
  const sigY = doc.lastAutoTable.finalY + 25;
  doc.setFontSize(8);
  doc.setTextColor(...LIGHT_TEXT);
  doc.setFont('helvetica', 'normal');
  doc.text('Signature', sigX, sigY);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.rect(sigX, sigY + 2, 50, 20, 'S');

  // Modalités de paiement (RIB)
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_COLOR);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations de paiement :', 15, bottomY - 10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...LIGHT_TEXT);
  doc.text(`Banque : ${EMETTEUR.banque}`, 15, bottomY - 5);
  doc.text(`RIB : ${EMETTEUR.rib}`, 15, bottomY);

  // --- Pied de page ---
  doc.setDrawColor(226, 232, 240);
  doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
  
  doc.setFontSize(8);
  doc.setTextColor(...LIGHT_TEXT);
  doc.setFont('helvetica', 'normal');
  const footerText = `${EMETTEUR.nom} - ${EMETTEUR.rc} | ${EMETTEUR.site}`;
  doc.text(footerText, pageWidth / 2, pageHeight - 12, { align: 'center' });
  const footerNote = 'Merci pour votre confiance. En cas de retard de paiement, des pénalités pourront être appliquées.';
  doc.text(footerNote, pageWidth / 2, pageHeight - 8, { align: 'center' });

  // --- Nom du fichier ---
  const formatNumero = safeNumero.replace(/\s/g, '-');
  doc.save(`Facture_${formatNumero}.pdf`);
}
