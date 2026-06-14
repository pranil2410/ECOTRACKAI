import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Profile, FootprintEntry, Goal } from '../types';

export const pdfService = {
  generateCarbonReport(
    profile: Profile,
    entries: FootprintEntry[],
    goals: Goal[],
    aiWeeklyGoal: string,
    aiInsights: string
  ): void {
    // Create PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor = [16, 185, 129]; // Emerald Green
    const darkColor = [17, 24, 39];      // Slate 900
    const grayColor = [100, 116, 139];    // Slate 500

    // --- PAGE 1: HEADER & TITLE ---
    // Background top bar
    doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.rect(0, 0, 210, 40, 'F');

    // Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('EcoTrack AI - Sustainability Report', 15, 20);

    // Date
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(162, 230, 219); // light green mint
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 28);

    // Profile metadata
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`User: ${profile.full_name || 'Eco Warrior'}`, 130, 18);
    doc.text(`Email: ${profile.email}`, 130, 24);
    doc.text(`Sustainability Level: ${profile.sustainability_level}`, 130, 30);

    // Divider line
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(1.5);
    doc.line(0, 40, 210, 40);

    // Carbon Summary Section
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('Carbon Footprint Summary', 15, 55);

    // Calculate categories totals
    let transport = 0;
    let energy = 0;
    let food = 0;
    let waste = 0;

    entries.forEach(e => {
      if (e.category === 'transport') transport += e.co2_emission;
      else if (e.category === 'energy') energy += e.co2_emission;
      else if (e.category === 'food') food += e.co2_emission;
      else if (e.category === 'waste') waste += e.co2_emission;
    });
    const total = transport + energy + food + waste;

    // Table of Carbon Category Summary
    const summaryRows = [
      ['Transportation', `${transport.toFixed(1)} kg CO2e`, `${((transport / (total || 1)) * 100).toFixed(0)}%`],
      ['Household Energy', `${energy.toFixed(1)} kg CO2e`, `${((energy / (total || 1)) * 100).toFixed(0)}%`],
      ['Dietary Footprint', `${food.toFixed(1)} kg CO2e`, `${((food / (total || 1)) * 100).toFixed(0)}%`],
      ['Waste Management', `${waste.toFixed(1)} kg CO2e`, `${((waste / (total || 1)) * 100).toFixed(0)}%`],
    ];

    autoTable(doc, {
      startY: 62,
      head: [['Carbon Category', 'CO2 Emissions', 'Percentage']],
      body: summaryRows,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, halign: 'left' },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'right' },
        2: { halign: 'right' }
      }
    });

    // Total Score Card box
    const tableFinalY = (doc as any).lastAutoTable.finalY || 100;
    
    doc.setFillColor(243, 244, 246); // Light gray panel
    doc.rect(15, tableFinalY + 10, 180, 24, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.rect(15, tableFinalY + 10, 180, 24, 'S');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('TOTAL CARBON EMISSIONS LOGGED', 22, tableFinalY + 17);
    doc.setFontSize(18);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`${total.toFixed(1)} kg CO2e`, 22, tableFinalY + 28);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('GREEN POINTS EARNED', 120, tableFinalY + 17);
    doc.setFontSize(18);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(`${profile.green_points} pts`, 120, tableFinalY + 28);

    // AI Coach Insights Section
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('AI Coach Recommendations', 15, tableFinalY + 46);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    
    // Insights text wrapping
    const splitInsights = doc.splitTextToSize(aiInsights || 'Start logging footprints to get custom insights.', 180);
    doc.text(splitInsights, 15, tableFinalY + 54);

    const insightsHeight = splitInsights.length * 5;
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('Weekly Green Target:', 15, tableFinalY + 58 + insightsHeight);
    
    doc.setFont('Helvetica', 'normal');
    doc.text(aiWeeklyGoal || 'Set up reduction targets in the Goals tab.', 55, tableFinalY + 58 + insightsHeight);

    // Page Break for Goals & Entries details
    doc.addPage();

    // Top Header for Page 2
    doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('Detailed Goals & Logs History', 15, 13);
    
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(1.0);
    doc.line(0, 20, 210, 20);

    // Goals Table
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('Active Carbon Reduction Targets', 15, 32);

    const goalRows = goals.map(g => [
      g.title, 
      `${g.target_reduction_pct}%`, 
      new Date(g.target_date).toLocaleDateString(), 
      g.status.toUpperCase()
    ]);

    autoTable(doc, {
      startY: 38,
      head: [['Goal Title', 'Reduction %', 'Target Date', 'Status']],
      body: goalRows.length > 0 ? goalRows : [['No goals registered yet', '-', '-', '-']],
      theme: 'striped',
      headStyles: { fillColor: darkColor }
    });

    const goalsFinalY = (doc as any).lastAutoTable.finalY || 60;

    // Detailed Log Table
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('Recent Activity Logs History', 15, goalsFinalY + 12);

    const logRows = entries.slice(0, 15).map(e => [
      new Date(e.recorded_date).toLocaleDateString(),
      e.category.toUpperCase(),
      e.sub_category.replace('_', ' '),
      `${e.value.toFixed(1)}`,
      `${e.co2_emission.toFixed(1)} kg`
    ]);

    autoTable(doc, {
      startY: goalsFinalY + 18,
      head: [['Date', 'Category', 'Activity Item', 'Value', 'CO2 Emission']],
      body: logRows.length > 0 ? logRows : [['No recent entries found', '-', '-', '-', '-']],
      theme: 'striped',
      headStyles: { fillColor: primaryColor }
    });

    // Save/Download file
    doc.save(`EcoTrack_Carbon_Report_${profile.full_name || 'User'}_${new Date().toISOString().split('T')[0]}.pdf`);
  }
};
