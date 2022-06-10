import {
    Alert,
    Button,
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TablePagination,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
} from '@mui/material';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Close } from '../lib/icons.component';

const Environment = ({ properties }: any) => {
    const [logs, setLogData] = useState<any>([]);
    const [status, setStatus] = useState<{
        isLoading: boolean;
        isError: boolean;
    }>({
        isLoading: false,
        isError: false,
    });
    const [data, setData] = useState<any>({
        key: '',
        value: '',
    });
    const [page, setPage] = useState<number>(0);
    const [rowPerPage, setRowPerPage] = useState<number>(10);
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);

    const handleData = (key: string, value: string | number) => {
        setData({ ...data, [key]: value });
    };

    useEffect(() => {
        axios
            .get(process.env.REACT_APP_ENV_URL ?? '', {
                auth: {
                    username: process.env.REACT_APP_AUTH_USERNAME ?? '',
                    password: process.env.REACT_APP_AUTH_PASSWORD ?? '',
                },
            })
            .then((e) => {
                const data = Object.entries(e.data).map(([key, value]) => ({
                    key,
                    value,
                }));
                setLogData(data);
            });
    }, []);

    const SubmitEnv = () => {
        if (data?.properties?.isUpdate) {
            axios
                .patch(
                    process.env.REACT_APP_ENV_URL ?? '',
                    { [data.key]: data.value },
                    {
                        auth: {
                            username: process.env.REACT_APP_AUTH_USERNAME ?? '',
                            password: process.env.REACT_APP_AUTH_PASSWORD ?? '',
                        },
                    }
                )
                .then((e) => {
                    const data = Object.entries(e.data).map(([key, value]) => ({
                        key,
                        value,
                    }));
                    setLogData(data);
                });
        }
    };

    const UpdateEnv = (data: any) => {
        setDialogIsOpen(true);
        setData({
            ...data,
            properties: { isUpdate: true },
        });
    };

    // const DeleteMusic = () => {
    //     setMusicDialogIsOpen(false);
    //     const id = musicData.properties.id + page * rowPerPage;
    //     remove(ref(getFirestore(), 'logs/' + id));
    // };

    const columns = [
        {
            id: 'key',
            label: 'Key',
            minWidth: 170,
        },
        {
            id: 'value',
            label: 'Value',
            minWidth: 100,
        },
        {
            id: 'delete',
            label: '',
            width: 'auto',
        },
    ];

    return (
        <div className="m-10">
            <TableContainer>
                <Table className="card">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align="left"
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs && logs?.length > 0 ? (
                            logs
                                .slice(
                                    page * rowPerPage,
                                    page * rowPerPage + rowPerPage
                                )
                                .map((song: any, index: number) => {
                                    return (
                                        <TableRow
                                            hover
                                            key={index}
                                            onClick={() => UpdateEnv(song)}
                                        >
                                            {columns.map((column) => {
                                                return (
                                                    <TableCell key={column.id}>
                                                        {column.id ===
                                                        'delete' ? (
                                                            <Button
                                                                onClick={() =>
                                                                    setDialogIsOpen(
                                                                        true
                                                                    )
                                                                }
                                                                variant="outlined"
                                                            >
                                                                <Close />
                                                            </Button>
                                                        ) : (
                                                            song[column.id]
                                                        )}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    );
                                })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3}>
                                    <LinearProgress />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                className="card"
                component="div"
                count={logs.length ?? 0}
                rowsPerPage={rowPerPage}
                page={page}
                onPageChange={(_, newPage) => {
                    setPage(newPage);
                }}
                onRowsPerPageChange={(e) => {
                    setPage(0);
                    setRowPerPage(+e.target.value);
                }}
            />

            <Dialog
                fullWidth
                open={dialogIsOpen}
                onClose={() => setDialogIsOpen(false)}
            >
                <DialogTitle className="error">
                    Delete Log Permanently
                </DialogTitle>
                <DialogContent>
                    {Object.keys(columns).map((_, index: number) => {
                        const { id, label } = columns[index];
                        return id !== 'delete' ? (
                            <TextField
                                required
                                id={id}
                                fullWidth
                                key={index}
                                type="text"
                                multiline={id === 'value'}
                                label={label}
                                margin="dense"
                                variant="standard"
                                value={data[id]}
                                onChange={(e) => handleData(id, e.target.value)}
                            />
                        ) : null;
                    })}
                </DialogContent>
                <DialogActions>
                    <Button
                        color="error"
                        onClick={() => setDialogIsOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={() => SubmitEnv()}>Update</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Environment;
