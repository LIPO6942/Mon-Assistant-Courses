const fs = require('fs');
const file = 'src/components/RecipesView.tsx';
let content = fs.readFileSync(file, 'utf8');

const sWheel = '              {/* Random Wheel UI - Compact */}';
const sPlatForm = '              {/* Add new item - Stylized & Compact */}';
const sPlatList = '              {/* List - Premium & Compact Cards (Plats only) */}';
const sEntrees = '              {/* Entrées Section (Collapsible) */}';
const eDbarati = '            </div>\n          </AccordionContent>';

const wheelIdx = content.indexOf(sWheel);
const platFormIdx = content.indexOf(sPlatForm);
const entreesIdx = content.indexOf(sEntrees);
const eDbaratiIdx = content.indexOf(eDbarati, entreesIdx);

let wheelBlock = content.substring(wheelIdx, platFormIdx);
let platFormListBlock = content.substring(platFormIdx, entreesIdx);
let entreesBlock = content.substring(entreesIdx, eDbaratiIdx);

// Modify entreesBlock to change the form
entreesBlock = entreesBlock.replace(
`                      <form
                        className="relative flex gap-2"
                        onSubmit={(e) => {`,
`                      <form
                        className="flex flex-col gap-3"
                        onSubmit={(e) => {`
);

entreesBlock = entreesBlock.replace(
`                         <Input
                          placeholder="Ajouter une entrée..."
                          className="rounded-xl h-10 text-sm border-primary/20 bg-background/50 flex-1"
                          value={newEntreeText}
                          onChange={(e) => setNewEntreeText(e.target.value)}
                        />
                        <div className="flex border border-primary/20 rounded-xl overflow-hidden shadow-sm h-10">`,
`                         <Input
                          placeholder="Ajouter une entrée..."
                          className="rounded-xl h-10 text-sm border-primary/20 bg-background/50 w-full"
                          value={newEntreeText}
                          onChange={(e) => setNewEntreeText(e.target.value)}
                        />
                        <div className="flex items-center gap-2">
                          <div className="flex border border-primary/20 rounded-xl overflow-hidden shadow-sm h-10 flex-1">`
);

entreesBlock = entreesBlock.replace(
`                        <Button 
                          type="submit" 
                          size="icon" 
                          className="h-10 w-10 rounded-xl shrink-0" 
                          disabled={!newEntreeText.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </form>`,
`                        <Button 
                          type="submit" 
                          size="icon" 
                          className="h-10 w-10 rounded-xl shrink-0" 
                          disabled={!newEntreeText.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        </div>
                      </form>`
);

entreesBlock = entreesBlock.replace(
  '              <div className="max-w-4xl mx-auto border-t border-border/40 pt-4 mt-6">',
  '              <div className="max-w-4xl mx-auto mb-8 pb-6 border-b border-border/40">'
);

// We should also make sure Plats only has the spacing it needs.
// Reassemble
const pre = content.substring(0, wheelIdx);
const post = content.substring(eDbaratiIdx);

const newContent = pre + entreesBlock + '\n' + wheelBlock + platFormListBlock + post;

fs.writeFileSync(file, newContent);
console.log('Done');
