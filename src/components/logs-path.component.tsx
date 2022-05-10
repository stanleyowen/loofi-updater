import { onValue, ref, set, remove, update } from '@firebase/database';
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
import {
    collection,
    getDoc,
    getDocs,
    getFirestore,
    orderBy,
    query,
} from 'firebase/firestore';
import React, { useState, useEffect } from 'react';

const Music = ({ properties }: any) => {
    const [logs, setLogData] = useState<any>([]);
    const [status, setStatus] = useState<{
        isLoading: boolean;
        isError: boolean;
    }>({
        isLoading: false,
        isError: false,
    });
    const [page, setPage] = useState<number>(0);
    const [rowPerPage, setRowPerPage] = useState<number>(10);
    const [musicDialogIsOpen, setMusicDialogIsOpen] = useState<boolean>(false);
    const [musicData, setMusicData] = useState<any>({
        audio: '',
        author: '',
        image: '',
        title: '',
        properties: {
            isUpdate: false,
            id: null,
        },
    });

    const handleStatus = (id: string, value: boolean) => {
        setStatus({ ...status, [id]: value });
    };
    const handleMusicData = (id: string, value: string) => {
        setMusicData({ ...musicData, [id]: value });
    };

    useEffect(() => {
        getDocs(
            query(
                collection(getFirestore(), 'logs-path/'),
                orderBy('timestamp', 'desc')
            )
        ).then((snapshot) => {
            const rawLogs: any = [];
            snapshot.docs.map((doc) => rawLogs.push(doc.data()));
            setLogData(rawLogs);
        });
    }, []);

    // const DeleteMusic = () => {
    //     setMusicDialogIsOpen(false);
    //     const id = musicData.properties.id + page * rowPerPage;
    //     remove(ref(getFirestore(), 'logs/' + id));
    // };

    const columns = [
        {
            id: 'user',
            label: 'User',
            minWidth: 170,
        },
        {
            id: 'path',
            label: 'Path',
            minWidth: 100,
        },
        {
            id: 'timestamp',
            label: 'Timestamp',
            minWidth: 100,
        },
    ];

    return (
        <div className="m-10">
            <div className="col-2 mb-10">
                <div className="card p-10">
                    <h2 className="center-align">
                        {logs && logs.length === 0 ? '-' : logs.length}
                    </h2>
                    <p className="center-align">Music</p>
                </div>
                <div className="card p-10">
                    <h2 className="center-align">-</h2>
                    <p className="center-align">Music</p>
                </div>
            </div>

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
                                        <TableRow hover key={index}>
                                            {columns.map((column) => {
                                                return (
                                                    <TableCell key={column.id}>
                                                        {column.id ===
                                                        'timestamp'
                                                            ? new Date(
                                                                  song.timestamp
                                                                      .seconds *
                                                                      1000
                                                              ).toLocaleDateString(
                                                                  'en-US',
                                                                  {
                                                                      weekday:
                                                                          'short', // long, short, narrow
                                                                      day: 'numeric', // numeric, 2-digit
                                                                      year: 'numeric', // numeric, 2-digit
                                                                      month: 'long', // numeric, 2-digit, long, short, narrow
                                                                      hour: 'numeric', // numeric, 2-digit
                                                                      minute: 'numeric', // numeric, 2-digit
                                                                      second: 'numeric', // numeric, 2-digit
                                                                  }
                                                              )
                                                            : song[column.id]}
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
                open={musicDialogIsOpen}
                onClose={() => {
                    setMusicDialogIsOpen(false);
                    setMusicData({
                        audio: '',
                        author: '',
                        image: '',
                        title: '',
                        properties: {
                            isUpdate: false,
                            id: null,
                        },
                    });
                }}
            >
                <DialogTitle>Add Music</DialogTitle>
                <DialogContent>
                    {status.isError ? (
                        <Alert severity="error" className="w-100 border-box">
                            Something went wrong. Please try again.
                        </Alert>
                    ) : null}

                    {Object.keys(musicData).map(
                        (data: string, index: number) => {
                            if (data === 'properties') return null;
                            else
                                return (
                                    <TextField
                                        fullWidth
                                        type="text"
                                        key={index}
                                        label={
                                            Array.from(data)[0].toUpperCase() +
                                            data.slice(1)
                                        }
                                        margin="dense"
                                        variant="standard"
                                        autoFocus={index === 0}
                                        value={musicData[data]}
                                        onChange={(e) =>
                                            handleMusicData(
                                                data,
                                                e.target.value
                                            )
                                        }
                                    />
                                );
                        }
                    )}
                </DialogContent>
                <DialogActions>
                    <Button color="error" disabled={status.isLoading}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Music;
