const fs = require('fs');

// Function to convert snake_case to camelCase
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (match, char) => char.toUpperCase());
}

// Function to process the schema file
function processPrismaSchema() {
  const schemaPath = 'prisma/schema.prisma';
  let schemaContent = fs.readFileSync(schemaPath, 'utf8');

  // Regex to find model and field names that are snake_case
  // This is a simplified regex, a robust solution would be more complex
  const regex = /(model\s+(\w+)\s+{)|(\s+(\w+)\s+[^@\n]+)/g;

  let newContent = schemaContent.replace(regex, (match, model, modelName, field, fieldName) => {
    if (model) {
      const camelCaseName = toCamelCase(modelName);
      if (modelName !== camelCaseName) {
        return `model ${camelCaseName} {
  @@map("${modelName}")`;
      }
      return match;
    }
    if (field) {
      const camelCaseName = toCamelCase(fieldName);
      if (fieldName !== camelCaseName) {
        return `  ${camelCaseName} ${field.trim().replace(fieldName, '').trim()} @map("${fieldName}")`;
      }
      return match;
    }
    return match;
  });

  fs.writeFileSync(schemaPath, newContent);
  console.log('Prisma schema updated with camelCase mapping.');
}

processPrismaSchema();