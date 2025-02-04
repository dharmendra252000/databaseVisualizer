# Database Visualizer

A dynamic React-based database schema visualization tool that allows users to create and manipulate database table relationships through an interactive drag-and-drop interface.

## Features

- **Interactive Table Management**

  - Drag and drop tables from the sidebar onto the workspace
  - Resize tables using the bottom-right corner handle
  - Move tables freely within the workspace
  - Remove tables with a single click

- **Column Management**

  - View column names and data types
  - Create relationships between columns through drag-and-drop
  - Visual connection lines between related columns

- **Visual Relationship Mapping**

  - Create relationships by dragging between columns
  - Curved connection lines with endpoint markers
  - Auto-updating connections when tables are moved
  - Prevention of duplicate connections

- **User Interface**
  - Clean, modern interface with a sidebar for available tables
  - Visual feedback for actions through alerts
  - Smooth animations for table movements and connections
  - Responsive design that adapts to different screen sizes

## Dependencies

- React
- Lucide React (for icons)
- Tailwind CSS (for styling)

## Installation

1. Install the required dependencies:

```bash
npm install react lucide-react
```

2. Add Tailwind CSS to your project if not already installed:

```bash
npm install tailwindcss
```

## Usage

1. Import the DatabaseVisualizer component:

```javascript
import DatabaseVisualizer from "./components/DatabaseVisualizer";
```

2. Use the component in your React application:

```javascript
function App() {
  return (
    <div>
      <DatabaseVisualizer />
    </div>
  );
}
```

## Component Structure

- **Main Grid**: A flexible workspace where tables can be placed and manipulated
- **Sidebar**: Contains available tables that can be dragged into the workspace
- **Table Components**: Individual table visualizations with:
  - Header with table name
  - Column list
  - Resize handle
  - Move handle
  - Remove button

## Interactions

1. **Adding Tables**

   - Drag a table from the sidebar onto the grid
   - Tables are automatically positioned at the drop location

2. **Moving Tables**

   - Click and drag the move handle (horizontal grip icon) to reposition

3. **Resizing Tables**

   - Drag the bottom-right corner to resize
   - Minimum dimensions are enforced (200px width, 150px height)

4. **Creating Relationships**

   - Drag from one column's connection point to another
   - Visual feedback shows valid connection points
   - Duplicate connections are prevented

5. **Removing Elements**
   - Click the X icon to remove a table
   - Removing a table automatically removes its connections

## Error Handling

- Prevents duplicate table additions
- Validates connection creation
- Provides visual feedback through alerts for various actions

## Customization

The component can be customized by:

- Modifying the initial tables array
- Adjusting table minimum dimensions
- Changing the color scheme through Tailwind classes
- Modifying connection line styles

## Technical Notes

- Uses React hooks (useState, useRef, useEffect) for state management
- SVG-based connection lines with Bezier curves
- Event-based drag and drop implementation
- Responsive to container size changes

## Browser Support

Supports all modern browsers that implement:

- Drag and Drop API
- SVG
- CSS Grid/Flexbox
- Modern JavaScript features

## License

MIT License
