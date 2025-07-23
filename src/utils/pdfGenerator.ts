import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

// Define types for recipe data
interface Instruction {
  step: number;
  title?: string;
  description: string;
}

interface NutritionPer100g {
  energy: string;
  fat: string;
  saturatedFat: string;
  carbs: string;
  sugar: string;
  protein: string;
  salt: string;
}

interface DishData {
  id: number;
  name: string;
  description: string;
  image?: string;
  cookTime: number;
  servings: number;
  difficulty: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  price?: number;
  category: string;
  diets: string[];
  allergens: string[];
  ingredients: string[];
  equipment?: string[];
  instructions: Instruction[];
  nutritionPer100g?: NutritionPer100g;
  tags?: string[];
  rating?: number;
}

/**
 * Generate a PDF for a recipe
 * @param dish Recipe data object
 */
export const generateRecipePDF = async (dish: DishData) => {
  // Create new PDF document
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Set text color and font
  pdf.setTextColor(34, 66, 41); // Dark green color
  pdf.setFont('helvetica', 'bold');

  // Add title
  pdf.setFontSize(24);
  pdf.text(dish.name, 20, 20);

  // Add logo and header
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'normal');
  pdf.text('SMAKOWAŁO', 20, 10);

  // Add recipe description
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');

  // Split description into multiple lines if needed
  const descriptionLines = pdf.splitTextToSize(dish.description, 170);
  pdf.text(descriptionLines, 20, 30);

  let yPos = 30 + (descriptionLines.length * 6);

  // Add cooking info
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Informacje o przepisie', 20, yPos);
  yPos += 8;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');

  const cookingInfo = [
    `Czas przygotowania: ${dish.cookTime} minut`,
    `Liczba porcji: ${dish.servings}`,
    `Poziom trudności: ${dish.difficulty}`,
    `Kalorie: ${dish.calories} kcal`,
    `Kategoria: ${dish.category}`,
    `Diety: ${dish.diets.join(', ')}`
  ];

  for (const info of cookingInfo) {
    pdf.text(info, 20, yPos);
    yPos += 6;
  }

  yPos += 5;

  // Add ingredients section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Składniki', 20, yPos);
  yPos += 8;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');

  for (const ingredient of dish.ingredients) {
    pdf.text(`• ${ingredient}`, 20, yPos);
    yPos += 6;
  }

  yPos += 5;

  // Add equipment section if available
  if (dish.equipment && dish.equipment.length > 0) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Potrzebne wyposażenie', 20, yPos);
    yPos += 8;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    for (const item of dish.equipment) {
      pdf.text(`• ${item}`, 20, yPos);
      yPos += 6;
    }

    yPos += 5;
  }

  // Check if we need a new page for instructions
  if (yPos > 240) {
    pdf.addPage();
    yPos = 20;
  }

  // Add instructions section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Instrukcje przygotowania', 20, yPos);
  yPos += 8;

  pdf.setFontSize(11);

  for (const instruction of dish.instructions) {
    // Add new page if needed
    if (yPos > 260) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.setFont('helvetica', 'bold');
    const stepTitle = instruction.title ?
      `Krok ${instruction.step}: ${instruction.title}` :
      `Krok ${instruction.step}`;

    pdf.text(stepTitle, 20, yPos);
    yPos += 6;

    pdf.setFont('helvetica', 'normal');
    const descLines = pdf.splitTextToSize(instruction.description, 170);
    pdf.text(descLines, 20, yPos);
    yPos += (descLines.length * 6) + 4;
  }

  // Add nutrition table if available
  if (dish.nutritionPer100g) {
    // Check if we need a new page
    if (yPos > 200) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Wartości odżywcze (na 100g)', 20, yPos);
    yPos += 10;

    const nutritionData = [
      ['Składnik', 'Wartość'],
      ['Energia', dish.nutritionPer100g.energy],
      ['Tłuszcze', dish.nutritionPer100g.fat],
      ['Tłuszcze nasycone', dish.nutritionPer100g.saturatedFat],
      ['Węglowodany', dish.nutritionPer100g.carbs],
      ['Cukry', dish.nutritionPer100g.sugar],
      ['Białko', dish.nutritionPer100g.protein],
      ['Sól', dish.nutritionPer100g.salt]
    ];

    autoTable(pdf, {
      startY: yPos,
      head: [nutritionData[0]],
      body: nutritionData.slice(1),
      theme: 'grid',
      styles: {
        fontSize: 11,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [76, 148, 71], // Green color
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      }
    });
  }

  // Add footer
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(
      `smakowalo.pl | Strona ${i} z ${totalPages}`,
      pdf.internal.pageSize.getWidth() / 2,
      pdf.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Download the PDF
  pdf.save(`smakowalo-przepis-${dish.id}.pdf`);
};
