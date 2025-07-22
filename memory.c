#include <stdlib.h>

#include "memory.h"

#include "object.h"
#include "vm.h"

#include <stdio.h>

void* reallocate(void* pointer, size_t _oldSize, size_t newSize) {
    if (newSize == 0) {
        free(pointer);
        return NULL;
    }

    void* result = realloc(pointer, newSize);
    if (result == NULL)
        exit(1);
    return result;
}

static void freeObject(Obj* obj) {
    switch (obj->type) {
        case OBJ_STRING:
            ObjString* string = (ObjString*) obj;
            FREE_ARRAY(char, string->chars, string->length + 1);
            FREE(ObjString, obj);
            break;
        default:
            printf("Free not implemented for %d", obj->type);
            exit(1);
    }
}

void freeObjects() {
    Obj* current = vm.objects;
    while (current != NULL) {
        Obj* next = current->next;
        freeObject(current);
        current = next;
    }
}