import { createTheme, MantineColorsTuple, virtualColor } from "@mantine/core"
const green: MantineColorsTuple = [
	"#f6f6f4",
	"#eaeae9",
	"#d2d3cf",
	"#babab1",
	"#a5a697",
	"#979987",
	"#91937d",
	"#7d7f6a",
	"#6f715d",
	"#5f614c",
]
const gray: MantineColorsTuple = [
	"#fef2f5",
	"#eae6e7",
	"#cdcdcd",
	"#b2b2b2",
	"#9a9a9a",
	"#8b8b8b",
	"#848484",
	"#717171",
	"#676465",
	"#5e5457",
]

const purple: MantineColorsTuple = [
	"#fcf2f8",
	"#ebe5e9",
	"#d0cace",
	"#b5aeb2",
	"#9e959b",
	"#90868c",
	"#8a7d86",
	"#786b73",
	"#6c5e67",
	"#61505b",
]

const theme = createTheme({
	primaryColor: "green",
	colors: {
		gray,
		green,
		grape: purple,
	},
})

export default theme
