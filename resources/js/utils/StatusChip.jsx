import { Chip } from "@mui/material"

export const StatusChip = (status) => {

    const cofig = {
        0 : {label: "InActive", color:"#ffe6ea"},
        1 : {label: "Active", color:"lightgreen"},
        "paid" : {label: "paid", color:"lightgreen"},
        "pending" : {label: "pending", color:"#ffe6ea"},
    }
    return <Chip
        label={cofig[status]?.label ?? status}
        variant="outlined"
        sx={{
          textTransform: 'capitalize',
          backgroundColor: cofig[status]?.color ?? 'lightgreen',
          color: '#000',
          marginBottom:2.5,
        }}
      />
}