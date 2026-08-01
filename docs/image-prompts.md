# Image generation prompts

For posts missing a `featuredImage`. Paste into ChatGPT / an image model, then
save the result and add `featuredImage:` + `featuredImageAlt:` to the post's
frontmatter.

## House style — prepend or keep consistent across all of them

> Editorial magazine photography. Natural window light from one side, soft
> shadows, shallow depth of field. Muted warm palette: cream, stone grey, warm
> oak, with a single muted gold accent. Matte surfaces, no glossy highlights, no
> food styling gloss or glycerin sheen. Slightly imperfect and real, not
> catalogue-perfect. Composed with generous negative space. **No text, no
> lettering, no logos, no watermarks, no brand marks of any kind. No people's
> faces.** 1200×630, landscape.

Three rules that matter more than the wording:

1. **No brand marks.** Several posts name Starbucks, Dunkin', Cinnabon and
   Swiss Miss. The images must not depict their logos, cups or packaging — we
   run a non-affiliation disclaimer and the artwork has to honor it.
2. **The image must not contradict the article.** This has already bitten us:
   stock photos of marshmallow-topped casserole for a no-marshmallow post,
   roasted wedges for a boil-don't-roast recipe. Read the prompt against the
   headline before accepting a result.
3. **No text in the image.** Generated lettering is nearly always subtly wrong
   and it is the single clearest tell that an image was machine-made.

---

## Priority 1 — Big Food section

### `big-food-added-sugar-disclosure-gap`
> A single unbranded white paper bakery bag and a plain packaged carton side by
> side on a pale stone counter. The carton's back panel faces the camera showing
> an abstract, unreadable nutrition-panel-shaped grid of lines; the paper bag has
> no label at all. Even, cool daylight. The visual point is that one carries
> information and the other carries none. No readable text, no brands.

### `do-ultra-processed-foods-make-you-eat-more`
> Two identical plain white plates on a pale stone surface, shot from directly
> above. Left plate: whole unprocessed foods — an apple, a boiled egg, plain
> oats, a handful of almonds. Right plate: the same volume of anonymous
> beige-and-tan packaged snack foods in unbranded generic forms — crackers,
> puffed shapes, a wrapped bar with blank packaging. Equal portions, deliberately
> similar in bulk. Clinical, neutral, documentary lighting. No text, no brands.

### `is-big-food-making-society-dumber`
> A vintage glass salt cellar with a small brass spoon on a worn oak table,
> beside a stack of mid-century school exam papers with abstract unreadable
> markings. Warm late-afternoon window light, dust visible in the beam. Quiet,
> archival, slightly nostalgic — the feel of a 1950s public-health archive. No
> readable text, no faces, no brands.

*(This one is worth getting right — the iodine story is the spine of the
article, and a salt-and-schoolroom image carries it in one frame.)*

---

## Priority 2 — food and drink posts

### `what-a-pumpkin-spice-latte-does-to-your-body`
> A plain unbranded white ceramic cup of spiced latte on a stone surface, seen
> from a low three-quarter angle. Beside it, loose whole spices — cinnamon
> sticks, star anise, cloves — and a small heap of raw sugar crystals
> deliberately larger than looks comfortable. Warm autumn light, long shadows.
> The sugar is the subject, the drink is the setting. Absolutely no branded cup,
> sleeve, logo or green.

### `trendy-starbucks-orders-what-they-do-to-your-body`
> Three unbranded clear glass drinking vessels in a row on a pale stone counter,
> each holding a different autumn drink: an orange-tan spiced latte, a pale
> milky chai, a dark cold brew topped with cream foam. Shot straight on at cup
> height, evenly spaced, catalogue-neutral. Soft diffused daylight. Plain glass
> only — no branded cups, sleeves, lids, straws or logos.

### `healthy-cinnamon-rolls-recipe-ceylon`
> Soft homemade cinnamon rolls in a well-used ceramic baking dish, one roll
> lifted slightly to show a tender spiral with dark date-paste filling. A thin
> pale yogurt glaze, not a thick white icing cap. Beside the dish, two small
> piles of ground cinnamon in visibly different shades — one lighter and tan,
> one darker and redder — with a few quills of soft, papery, multi-layered
> Ceylon cinnamon bark. Warm kitchen light, flour dust on the wood.

*Note: Ceylon bark looks like a thin fragile cigar of many layers; cassia is a
single thick hard curl. If the model draws two identical sticks the image
undercuts the whole article.*

### `healthy-pumpkin-bread-recipe-no-refined-sugar`
> A dark-crumbed pumpkin loaf on a wooden board, three slices cut and fanned so
> the moist interior shows. Visibly whole-grain — flecked, dense, not cake-pale.
> Beside it a few whole Medjool dates and a small open can of plain pumpkin
> purée with a blank unlabeled side facing camera. Warm morning light, linen
> cloth. Rustic and homemade, not bakery-glossy. No frosting, no streusel.

### `healthy-sweet-potato-casserole-no-marshmallows`
> A rustic ceramic baking dish of mashed sweet potato casserole topped with a
> golden pecan-and-rolled-oat crumble — toasted nuts and oats clearly visible.
> **Absolutely no marshmallows anywhere in the frame.** A serving spoon lifts a
> portion showing the deep orange mash underneath. Warm holiday table light,
> linen napkin, a few loose pecan halves scattered.

*This post exists to argue against the marshmallow version. A single marshmallow
in frame makes the image contradict the headline.*

---

## Priority 3 — older wellness posts

These share a quieter, less literal style — closer to editorial abstraction than
to product photography. Shared modifier:

> Calm editorial wellness photography, muted stone and sage palette, natural
> light, human presence implied but no visible faces, generous negative space.

| Post | Prompt subject |
|---|---|
| `science-of-sleep-nightly-routines-better-rest-focus` | Rumpled linen bedding in early blue pre-dawn light, a book face-down, an unlit lamp, no screens |
| `gut-health-daily-habits-improve-digestion-reduce-stress` | Overhead of fermented foods in glass jars — kraut, kefir, kimchi — on a stone counter with soft steam from a mug |
| `desk-detox-daily-movement-routines-counteract-sedentary-work-life` | An empty ergonomic chair pushed back from a standing desk, morning light across the floor, a yoga mat half-unrolled |
| `digital-overload-daily-habits-reduce-screen-fatigue-boost-focus` | A phone face-down on a wooden table beside a paper notebook and pen, window light, plant shadow across the surface |
| `mindful-minutes-journaling-breathwork-stress-resilience` | An open blank journal with a fountain pen resting in the gutter, a cup of tea, single-side window light |
| `burnout-prevention-workplace-daily-health-routines-resilience` | A quiet empty office corner at golden hour, one chair, a plant, low warm light through blinds |
| `building-resilient-workforce-daily-health-habits-employee-wellness` | An empty modern office breakroom with fruit in a bowl and water carafes, bright and airy, no people |
| `employee-wellness-integrating-habit-tracking-self-care-company-culture` | A paper habit-tracker grid on a clipboard with hand-marked checkmarks (marks only, no words), coffee, morning light |
| `habit-loop-explained-build-sustainable-self-care-routines` | A looping length of natural rope arranged in a soft circle on stone, overhead, single light source |
| `low-energy-high-performance-hydration-habits-boost-workday` | A glass water bottle and a tumbler with condensation on a sunlit desk, lemon slice, sharp light and shadow |
| `nature-first-wellness-daily-habits-health-without-quick-fixes` | A forest trail in morning mist with light through trees, a worn walking path, no people |
| `personalized-wellness-tailoring-daily-routine-fit-lifestyle` | Overhead flat lay of mismatched personal objects — running shoe, tea, journal, headphones — arranged on stone, warm neutral |

---

## After generating

Add to the post's frontmatter:

```yaml
featuredImage: /images/blog/<slug>.jpg
featuredImageAlt: <a literal description of what is in the frame>
```

The alt text must describe the image, not restate the headline — it is read
aloud to screen-reader users and it is also a genuine ranking signal. Save
images at 1200×630 and under ~200 KB.
