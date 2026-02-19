// src/components/faculty/ApprovalCard.jsx
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  TextField,
  Link,
  Stack,
  Divider,
} from "@mui/material";

export default function ApprovalCard({ activity, onApprove, onReject }) {
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const id = activity.id ?? activity._id;
  const student = activity.student ?? activity.submittedBy ?? {};
  const attachments = activity.attachments ?? activity.files ?? [];

  async function handleApprove() {
    setProcessing(true);
    try {
      await onApprove(id);
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject() {
    setProcessing(true);
    try {
      await onReject(id, reason);
      setShowReason(false);
      setReason("");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <Card variant="outlined" className="bg-white border border-gray-200 rounded-xl p-8 w-full max-w-[600px] text-left transition-[box-shadow,transform] duration-200 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:-translate-y-[3px]">
      <CardContent>
        <Typography variant="h6" className="text-[1.2rem] font-semibold mb-1 text-gray-900">
          {activity.title ?? "Untitled Activity"}
        </Typography>

        <Typography variant="body2" className="text-base text-gray-500 mb-3">
          By: {student.name || student.fullName || "Unknown"} —{" "}
          {student.enrollment || student.id || ""}
        </Typography>

        <Typography variant="body1" className="text-[1.05rem] text-gray-700 mb-3 whitespace-pre-wrap">
          {activity.description ?? ""}
        </Typography>

        {attachments.length > 0 && (
          <Stack direction="column" spacing={0.5} className="mt-2">
            {attachments.map((att, idx) => (
              <Link
                key={idx}
                href={att.url ?? att.blobUrl ?? att.sasUrl}
                target="_blank"
                rel="noreferrer"
              >
                {att.filename ?? att.name ?? `Attachment ${idx + 1}`}
              </Link>
            ))}
          </Stack>
        )}
      </CardContent>

      <CardActions className="flex gap-3 mt-4">
        <Button
          size="small"
          className="py-2 px-5 rounded-lg text-base cursor-pointer border-none bg-[#1976d2] text-white"
          onClick={handleApprove}
          disabled={processing}
        >
          {processing ? "Processing..." : "Approve"}
        </Button>
        <Button
          size="small"
          className="py-2 px-5 rounded-lg text-base cursor-pointer border-none bg-gray-200 text-gray-900"
          onClick={() => setShowReason((s) => !s)}
        >
          {showReason ? "Cancel" : "Reject"}
        </Button>
      </CardActions>

      {showReason && (
        <Box className="p-4">
          <TextField
            label="Reason for rejection (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            size="small"
          />
          <Box className="flex justify-end gap-2 mt-2">
            <Button
              size="small"
              color="error"
              variant="contained"
              onClick={handleReject}
              disabled={processing}
            >
              Submit Reject
            </Button>
          </Box>
        </Box>
      )}
    </Card>
  );
}
