import { useState } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";

export default function FileUpload({ onFileSelect }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (onFileSelect) {
      onFileSelect(selected);
    }
  };

  return (
    <Paper
      elevation={4}
      className="border-2 border-dashed border-[#90caf9] rounded-xl p-8 text-center bg-[#f9fbff] cursor-pointer transition-all duration-300 hover:border-[#1976d2] hover:bg-[#f1f5ff]"
    >
      <Typography variant="h6" gutterBottom>
        📂 Upload File
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {file ? `Selected: ${file.name}` : "Drag & Drop or Click to Upload"}
      </Typography>

      <Button
        variant="contained"
        component="label"
        className="mt-4 rounded-lg"
      >
        Choose File
        <input type="file" hidden onChange={handleFileChange} />
      </Button>
    </Paper>
  );
}
