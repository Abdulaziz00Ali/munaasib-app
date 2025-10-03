export const translateCategory = (category: string | undefined): string => {
  if (!category) return '';
  switch (category.toLowerCase()) {
    case 'hall':
    case 'halls':
      return 'قاعات';
    case 'kitchen':
    case 'kitchens':
      return 'مطابخ';
    case 'coffee':
      return 'قهوجية';
    case 'accessories':
      return 'كماليات';
    default:
      return category;
  }
};
