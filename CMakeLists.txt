cmake_minimum_required(VERSION 3.30)
project(clox C)

set(CMAKE_C_STANDARD 11)

add_executable(clox main.c
        chunk.c
        chunk.h
        compiler.h
        compiler.c
        memory.h
        memory.c
        debug.h
        debug.c
        value.h
        value.c
        vm.h
        vm.c
        vm.h
        scanner.h
        scanner.c
        object.h
        object.c
        table.h
        table.c)
