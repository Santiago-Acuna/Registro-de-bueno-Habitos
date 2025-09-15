const fs = require('fs');

function toCamelCase(str) {
  return str.replaceAll(/_([a-z])/g, (match, char) => char.toUpperCase());
}

function isUpperCase(str) {
  return str === String(str).toUpperCase();
}

function processPrismaSchema() {
  const schemaPath = '../prisma/schema.prisma';
  let schemaContent = fs.readFileSync(schemaPath, 'utf8');
  const modelRegex = /(model\s+(\w+)\s+{)/g;
  const fieldRegex = /(\s+(\w+)\s+[^@\n]+)/g;
  const indexRegex = /\[(.*?)\]/g;
  let newContent = schemaContent.replace(modelRegex, (match, model, modelName) => {
    const camelCaseName = toCamelCase(modelName);
    if (modelName !== camelCaseName) {
      return `model ${camelCaseName} {
  @@map("${modelName}")`;
    } else { return match }

  });
  newContent = newContent.replace(fieldRegex, (match, field, fieldName) => {

    const camelCaseName = toCamelCase(fieldName);
    if (fieldName !== camelCaseName) {
      const fieldSplited = field.split(' ').filter( f => f.trim() !== "")
      const dataType = fieldSplited[fieldSplited.length - 1]
      const mapeo = `@map("${fieldName}")`
      let response = `\n  ${camelCaseName} ${field.trim().replace(fieldName, '').trim()}`
      if (isUpperCase(dataType.substring(0, 1))) return response + ` ${mapeo}`
      else {
        return response.replace(dataType, toCamelCase(dataType))
      }
    }
    return match;
  })

  newContent = newContent.replace(indexRegex, (match, content) => {
    const newContent = content.replace(/([-_][a-z])/g, group =>
      group
        .toUpperCase()
        .replace('-', '')
        .replace('_', '')
    );
    return `[${newContent}]`
  });

  fs.writeFileSync(schemaPath, newContent);
  console.log('Prisma schema updated with camelCase mapping.');
}

processPrismaSchema();