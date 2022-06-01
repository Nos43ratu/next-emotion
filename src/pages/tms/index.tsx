import type { GetServerSideProps, NextPage } from "next";
import { PrismaClient, Project } from "@prisma/client";
import { useState } from "react";
import {
  Box,
  Grid,
  Modal,
  Paper,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
} from "@mui/material";
import Link from "next/link";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/router";

interface PageProps {
  projects: Project[];
}

const Home: NextPage<PageProps> = ({ projects }) => {
  const router = useRouter();

  const refreshData = () => {
    router.replace(router.asPath);
  };

  return (
    <section>
      <Grid container spacing={3} sx={{ p: "16px" }}>
        {projects?.length !== 0 &&
          projects?.map((project, index) => (
            <Grid item key={index}>
              <Link href={`/tms/project/${project.id}`}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    display: "flex",
                    height: "150px",
                    width: "200px",
                    flexDirection: "column",
                    cursor: "pointer",
                  }}
                >
                  <Typography component="p" variant="h4">
                    {project.name}
                  </Typography>
                  {JSON.parse(project.locales).map(
                    (locale: string, index: number) => (
                      <Typography
                        key={index}
                        color="text.secondary"
                        sx={{ flex: 1 }}
                      >
                        {locale}
                      </Typography>
                    )
                  )}
                </Paper>
              </Link>
            </Grid>
          ))}
        <CreateProject refreshData={refreshData} />
      </Grid>
    </section>
  );
};

const CreateProject = ({ refreshData }: { refreshData: () => void }) => {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: "",
      ru: true,
      en: false,
    },
  });
  const [open, setOpen] = useState(false);

  const onSubmit = async (data: any) => {
    const locales = [data.en && "EN", data.ru && "RU"].filter(
      (locale) => locale
    );

    const body = {
      name: data.name,
      locales: JSON.stringify(locales),
    };

    await fetch("/api/tms/project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(() => {
      setOpen(false);
      refreshData();
    });
  };

  return (
    <Grid item onClick={() => setOpen(true)}>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          display: "flex",
          height: "150px",
          width: "200px",
          flexDirection: "column",
          cursor: "pointer",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AddBoxOutlinedIcon />
      </Paper>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Paper
            sx={{
              position: "absolute" as "absolute",
              top: "50%",
              left: "50%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
            }}
          >
            <Controller
              control={control}
              name="name"
              render={({ field }: { field: any }) => (
                <TextField {...field} required label="Project name" />
              )}
            />
            <Controller
              control={control}
              name="ru"
              render={({ field: { value, onChange } }) => (
                <FormControlLabel
                  control={<Checkbox checked={value} onChange={onChange} />}
                  label="RU"
                />
              )}
            />
            <Controller
              control={control}
              name="en"
              render={({ field: { value, onChange } }) => (
                <FormControlLabel
                  control={<Checkbox checked={value} onChange={onChange} />}
                  label="EN"
                />
              )}
            />
            <Button type="submit">Create project</Button>
          </Paper>
        </form>
      </Modal>
    </Grid>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const prisma = new PrismaClient();

  const projects = await prisma.project.findMany().then((res) =>
    res.map((project) => ({
      ...project,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    }))
  );

  return {
    props: { projects: projects },
  };
};
